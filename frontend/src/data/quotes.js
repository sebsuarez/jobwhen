// motivational quotes shown on the dashboard
// The dashboard picks one per login session
// add or remove entries here! 

const QUOTES = [
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it." },
  { text: "Your limitation — it's only your imagination." },
  { text: "Push yourself, because no one else is going to do it for you." },
  { text: "Great things never come from comfort zones." },
  { text: "Success doesn't just find you. You have to go out and get it." },
  { text: "The key to success is to focus on goals, not obstacles." },
  { text: "It's going to be hard, but hard does not mean impossible." },
  { text: "Don't stop when you're tired. Stop when you're done." },
  { text: "Wake up with determination. Go to bed with satisfaction." },
  { text: "Rejection is redirection." },
  { text: "Little things make big days." },
  { text: "Dream it. Wish it. Do it." },
]

const QUOTE_SESSION_KEY = 'jobwhen_quote'

export function getSessionQuote() {
  const stored = sessionStorage.getItem(QUOTE_SESSION_KEY)
  if (stored) return JSON.parse(stored)

  // we pick a new quote and persist it for this login session
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  sessionStorage.setItem(QUOTE_SESSION_KEY, JSON.stringify(quote))
  return quote
}

export function clearSessionQuote() {
  sessionStorage.removeItem(QUOTE_SESSION_KEY)
}
