import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  name: string
  email: string
  xp: number
  level: number
  badges: string[]
  total_focus_minutes: number
  streak_days: number
  created_at: string
  updated_at: string
}

export type Goal = {
  id: string
  user_id: string
  name: string
  progress: number
  category: string
  deadline: string
  color: string
  created_at: string
  updated_at: string
}

export type Habit = {
  id: string
  user_id: string
  name: string
  streak: number
  done_today: boolean
  last_done_date: string | null
  color: string
  created_at: string
}

export type JournalEntry = {
  id: string
  user_id: string
  title: string
  body: string
  tags: string[]
  mood: number
  created_at: string
  updated_at: string
}

export type Checkin = {
  id: string
  user_id: string
  mood: number
  energy: number
  note: string
  created_at: string
}
