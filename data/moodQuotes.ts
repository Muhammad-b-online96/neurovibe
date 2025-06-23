import { MoodQuote } from '@/types';

export const moodQuotes: MoodQuote[] = [
  // Overwhelmed quotes
  {
    text: "You don't have to be perfect. You just have to be you.",
    author: "Unknown",
    mood: "overwhelmed"
  },
  {
    text: "It's okay to take breaks. Your mental health matters.",
    mood: "overwhelmed"
  },
  {
    text: "One step at a time. You've got this.",
    mood: "overwhelmed"
  },
  {
    text: "Breathe. This feeling will pass.",
    mood: "overwhelmed"
  },
  {
    text: "Your struggles don't define you. Your resilience does.",
    mood: "overwhelmed"
  },

  // Focused quotes
  {
    text: "Focus on what you can control, let go of what you can't.",
    mood: "focused"
  },
  {
    text: "Great things never come from comfort zones.",
    mood: "focused"
  },
  {
    text: "Your focus determines your reality.",
    author: "George Lucas",
    mood: "focused"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    mood: "focused"
  },
  {
    text: "The expert in anything was once a beginner.",
    mood: "focused"
  },

  // Low energy quotes
  {
    text: "Rest when you're weary. Refresh and renew yourself.",
    mood: "lowenergy"
  },
  {
    text: "Sometimes the most productive thing you can do is relax.",
    author: "Mark Black",
    mood: "lowenergy"
  },
  {
    text: "Be gentle with yourself. You're doing the best you can.",
    mood: "lowenergy"
  },
  {
    text: "Low energy doesn't mean low value. You matter.",
    mood: "lowenergy"
  },
  {
    text: "Even flowers need time to bloom. Give yourself grace.",
    mood: "lowenergy"
  },
];

export function getRandomQuoteForMood(mood: string): MoodQuote {
  const moodSpecificQuotes = moodQuotes.filter(quote => quote.mood === mood);
  const randomIndex = Math.floor(Math.random() * moodSpecificQuotes.length);
  return moodSpecificQuotes[randomIndex] || moodQuotes[0];
}