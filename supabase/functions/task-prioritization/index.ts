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

    const { userId, currentMood } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get pending tasks
    const { data: tasks, error } = await supabaseClient
      .from('focus_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Prioritization logic based on mood
    const prioritizedTasks = tasks.map(task => {
      let priority = 0
      let reasoning = []

      // Base priority on task age (newer tasks get slightly higher priority)
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceCreated > 7) {
        priority += 3
        reasoning.push('overdue')
      } else if (daysSinceCreated > 3) {
        priority += 2
        reasoning.push('aging')
      } else {
        priority += 1
        reasoning.push('recent')
      }

      // Mood-based prioritization
      switch (currentMood) {
        case 'overwhelmed':
          // For overwhelmed state, prioritize shorter, simpler tasks
          if (task.title.length < 30) {
            priority += 3
            reasoning.push('simple-task')
          }
          if (task.description && task.description.length < 50) {
            priority += 2
            reasoning.push('minimal-description')
          }
          // Deprioritize complex tasks
          if (task.description && task.description.length > 100) {
            priority -= 2
            reasoning.push('complex-task')
          }
          break

        case 'focused':
          // For focused state, prioritize more complex, important tasks
          if (task.description && task.description.length > 50) {
            priority += 3
            reasoning.push('detailed-task')
          }
          if (task.title.toLowerCase().includes('important') || 
              task.title.toLowerCase().includes('urgent')) {
            priority += 4
            reasoning.push('high-importance')
          }
          break

        case 'lowenergy':
          // For low energy, prioritize easy wins and maintenance tasks
          if (task.title.toLowerCase().includes('review') ||
              task.title.toLowerCase().includes('check') ||
              task.title.toLowerCase().includes('update')) {
            priority += 3
            reasoning.push('maintenance-task')
          }
          if (task.title.length < 25) {
            priority += 2
            reasoning.push('quick-task')
          }
          // Deprioritize complex tasks
          if (task.description && task.description.length > 80) {
            priority -= 1
            reasoning.push('avoid-complexity')
          }
          break

        default:
          // Default prioritization
          priority += 1
      }

      return {
        ...task,
        priority,
        reasoning
      }
    })

    // Sort by priority (highest first)
    prioritizedTasks.sort((a, b) => b.priority - a.priority)

    // Generate recommendations
    const recommendations = []
    
    if (currentMood === 'overwhelmed') {
      recommendations.push('Focus on completing 1-2 simple tasks to build momentum')
      recommendations.push('Break complex tasks into smaller, manageable steps')
    } else if (currentMood === 'focused') {
      recommendations.push('This is a great time to tackle your most challenging tasks')
      recommendations.push('Consider batching similar tasks together for efficiency')
    } else if (currentMood === 'lowenergy') {
      recommendations.push('Start with quick wins to preserve energy')
      recommendations.push('Consider delegating or postponing complex tasks')
    }

    const result = {
      currentMood,
      totalTasks: tasks.length,
      prioritizedTasks: prioritizedTasks.slice(0, 10), // Return top 10
      recommendations,
      moodStrategy: {
        overwhelmed: 'Simplify and reduce cognitive load',
        focused: 'Maximize productivity with challenging work',
        lowenergy: 'Conserve energy with easy wins'
      }[currentMood] || 'Maintain balanced approach'
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error prioritizing tasks:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})