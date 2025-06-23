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

    const { userId, days = 7 } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get emotional states from the last N days
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

    const { data, error } = await supabaseClient
      .from('emotional_states')
      .select('mood, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true })

    if (error) {
      throw error
    }

    // Analyze mood patterns
    const moodCounts = data.reduce((acc: Record<string, number>, state) => {
      acc[state.mood] = (acc[state.mood] || 0) + 1
      return acc
    }, {})

    const totalEntries = data.length
    const moodPercentages = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0
    }))

    // Determine dominant mood
    const dominantMood = moodPercentages.reduce((prev, current) => 
      prev.count > current.count ? prev : current
    )

    // Calculate mood stability (how often mood changes)
    let moodChanges = 0
    for (let i = 1; i < data.length; i++) {
      if (data[i].mood !== data[i - 1].mood) {
        moodChanges++
      }
    }
    
    const stabilityScore = totalEntries > 1 ? 
      ((totalEntries - moodChanges) / (totalEntries - 1)) * 100 : 100

    // Generate insights
    let insights = []
    
    if (dominantMood.percentage > 60) {
      insights.push(`You've been consistently ${dominantMood.mood} (${dominantMood.percentage.toFixed(1)}% of the time)`)
    } else {
      insights.push('Your moods have been quite varied lately')
    }

    if (stabilityScore > 70) {
      insights.push('Your mood has been relatively stable')
    } else if (stabilityScore < 40) {
      insights.push('Your mood has been fluctuating frequently')
    }

    const analysis = {
      period: `${days} days`,
      totalEntries,
      moodBreakdown: moodPercentages,
      dominantMood: dominantMood.mood,
      stabilityScore: Math.round(stabilityScore),
      insights,
      moodChanges
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error analyzing mood:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})