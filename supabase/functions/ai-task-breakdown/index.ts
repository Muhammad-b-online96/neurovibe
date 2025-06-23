import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { taskId, userId, mood, taskTitle, taskDescription } = await req.json()
    
    if (!taskId || !userId || !mood || !taskTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has dev mode enabled or subscription
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('dev_mode_enabled')
      .eq('id', userId)
      .single()

    if (!profile?.dev_mode_enabled) {
      return new Response(
        JSON.stringify({ error: 'AI features require subscription or dev mode' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare prompt based on mood and neurodivergent context
    const moodContext = {
      overwhelmed: "The user is feeling overwhelmed. Break this task into very small, manageable steps. Focus on reducing cognitive load and making each step feel achievable. Use calming, supportive language.",
      focused: "The user is in a focused state. Provide detailed, structured subtasks that maximize productivity. Include time estimates and prioritization suggestions.",
      lowenergy: "The user has low energy. Suggest gentle, low-effort subtasks. Focus on what can be done with minimal energy while still making progress."
    }

    const prompt = `
You are an AI assistant helping neurodivergent individuals manage tasks effectively. 

Current context:
- User mood: ${mood}
- Task: "${taskTitle}"
- Description: "${taskDescription || 'No description provided'}"

${moodContext[mood] || moodContext.focused}

Please break down this task into 3-5 specific, actionable subtasks. Format your response as a JSON object with this structure:
{
  "subtasks": [
    {
      "title": "Subtask title",
      "description": "Brief description",
      "estimatedTime": "5-10 minutes",
      "priority": "high|medium|low"
    }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "moodSpecificAdvice": "Advice tailored to current mood"
}

Keep subtasks concrete and specific. Avoid vague instructions.
`

    // Call Google Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      throw new Error('No response from Gemini API')
    }

    // Parse AI response
    let suggestion
    try {
      suggestion = JSON.parse(aiResponse)
    } catch {
      // If JSON parsing fails, wrap the response
      suggestion = {
        subtasks: [],
        tips: [aiResponse],
        moodSpecificAdvice: "AI provided general guidance for this task."
      }
    }

    // Store the AI assist in database
    const { data: aiAssist, error: insertError } = await supabaseClient
      .from('ai_task_assists')
      .insert({
        user_id: userId,
        task_id: taskId,
        suggestion: JSON.stringify(suggestion),
        mood: mood,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error storing AI assist:', insertError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestion,
        assistId: aiAssist?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in AI task breakdown:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})