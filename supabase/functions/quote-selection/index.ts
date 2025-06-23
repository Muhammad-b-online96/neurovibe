import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Extended quotes database organized by mood and context
const quotesDatabase = {
  overwhelmed: {
    morning: [
      { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
      { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
      { text: "One day at a time. One breath at a time. One step at a time." }
    ],
    afternoon: [
      { text: "It's okay to take breaks. Your mental health matters." },
      { text: "Progress, not perfection. You're doing better than you think." },
      { text: "Breathe in calm, breathe out chaos." }
    ],
    evening: [
      { text: "Rest is not a luxury, it's a necessity." },
      { text: "You survived today. That's enough." },
      { text: "Tomorrow is a fresh start with no mistakes in it yet.", author: "L.M. Montgomery" }
    ],
    weekend: [
      { text: "Weekends are for recharging your soul." },
      { text: "It's okay to do nothing today. Rest is productive too." },
      { text: "Your worth is not determined by your productivity." }
    ]
  },
  focused: {
    morning: [
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { text: "Focus on what you can control, let go of what you can't." },
      { text: "Your focus determines your reality.", author: "George Lucas" }
    ],
    afternoon: [
      { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
      { text: "The expert in anything was once a beginner." },
      { text: "Great things never come from comfort zones." }
    ],
    evening: [
      { text: "Reflect on your progress. Every step forward counts." },
      { text: "What you accomplished today brings you closer to your goals." },
      { text: "Consistency is the mother of mastery." }
    ],
    weekend: [
      { text: "Weekends are perfect for pursuing passion projects." },
      { text: "Use this energy to create something meaningful." },
      { text: "Focused effort on weekends can accelerate your dreams." }
    ]
  },
  lowenergy: {
    morning: [
      { text: "Be gentle with yourself. You're doing the best you can." },
      { text: "Even flowers need time to bloom. Give yourself grace." },
      { text: "Low energy doesn't mean low value. You matter." }
    ],
    afternoon: [
      { text: "Sometimes the most productive thing you can do is relax.", author: "Mark Black" },
      { text: "Rest when you're weary. Refresh and renew yourself." },
      { text: "It's okay to move slowly. Movement is still progress." }
    ],
    evening: [
      { text: "You don't have to be 'on' all the time. Rest is healing." },
      { text: "Self-compassion is the best gift you can give yourself." },
      { text: "Tomorrow's energy starts with tonight's rest." }
    ],
    weekend: [
      { text: "Weekends are for restoration and gentle self-care." },
      { text: "Slow weekends create space for inner peace." },
      { text: "There's beauty in stillness and quiet moments." }
    ]
  }
}

function getTimeContext(): string {
  const hour = new Date().getHours()
  const day = new Date().getDay()
  
  // Weekend check (Saturday = 6, Sunday = 0)
  if (day === 0 || day === 6) {
    return 'weekend'
  }
  
  if (hour < 12) {
    return 'morning'
  } else if (hour < 17) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mood, context, previousQuotes = [] } = await req.json()
    
    if (!mood) {
      return new Response(
        JSON.stringify({ error: 'Mood is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const timeContext = context || getTimeContext()
    const moodQuotes = quotesDatabase[mood]
    
    if (!moodQuotes) {
      return new Response(
        JSON.stringify({ error: 'Invalid mood provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get quotes for the specific context, fallback to morning if context not found
    const contextQuotes = moodQuotes[timeContext] || moodQuotes.morning
    
    // Filter out recently shown quotes to avoid repetition
    const availableQuotes = contextQuotes.filter(quote => 
      !previousQuotes.includes(quote.text)
    )
    
    // If all quotes have been shown, reset to full list
    const quotesToChooseFrom = availableQuotes.length > 0 ? availableQuotes : contextQuotes
    
    // Select a random quote
    const randomIndex = Math.floor(Math.random() * quotesToChooseFrom.length)
    const selectedQuote = quotesToChooseFrom[randomIndex]

    // Generate contextual insights
    const insights = {
      overwhelmed: {
        tip: "When overwhelmed, focus on one small task at a time. Breaking things down makes them manageable.",
        technique: "Try the 5-4-3-2-1 grounding technique: 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste."
      },
      focused: {
        tip: "Channel this focused energy into your most important tasks. This is prime time for deep work.",
        technique: "Use the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break."
      },
      lowenergy: {
        tip: "Honor your low energy by choosing gentle, nurturing activities. Rest is productive too.",
        technique: "Practice self-compassion. Ask yourself: 'What would I tell a good friend feeling this way?'"
      }
    }

    const response = {
      quote: selectedQuote,
      mood,
      context: timeContext,
      insight: insights[mood] || null,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error selecting quote:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})