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

    const { userId, mood, tasks } = await req.json()
    
    if (!userId || !mood || !tasks || !Array.isArray(tasks)) {
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

    const moodContext = {
      overwhelmed: "The user is overwhelmed. Prioritize simple, quick wins that will reduce stress. Avoid complex or high-pressure tasks.",
      focused: "The user is highly focused. Prioritize challenging, important tasks that require deep concentration and can make significant progress.",
      lowenergy: "The user has low energy. Prioritize easy, low-effort tasks that still provide a sense of accomplishment."
    }

    const tasksText = tasks.map(task => 
      `- "${task.title}"${task.description ? ` (${task.description})` : ''}`
    ).join('\n')

    const prompt = `
You are an AI assistant helping neurodivergent individuals prioritize their tasks effectively.

Current context:
- User mood: ${mood}
- ${moodContext[mood]}

Tasks to prioritize:
${tasksText}

Please analyze these tasks and provide prioritization advice. Format your response as a JSON object:
{
  "prioritizedTasks": [
    {
      "title": "Task title",
      "priority": 1,
      "reasoning": "Why this task should be prioritized given the current mood",
      "moodFit": "high|medium|low"
    }
  ],
  "generalAdvice": "Overall strategy for tackling these tasks in current mood",
  "energyManagement": "Tips for managing energy while working on these tasks"
}

Order tasks by priority (1 = highest priority).
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
      // If JSON parsing fails, provide fallback
      suggestion = {
        prioritizedTasks: tasks.map((task, index) => ({
          title: task.title,
          priority: index + 1,
          reasoning: "AI provided general guidance",
          moodFit: "medium"
        })),
        generalAdvice: aiResponse,
        energyManagement: "Take breaks as needed and listen to your body."
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestion,
        mood
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in AI task prioritization:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})