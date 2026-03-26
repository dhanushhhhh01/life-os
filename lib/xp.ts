import { supabase } from './supabase'

// XP awards for each action
export var XP_AWARDS = {
  CHECKIN: 20,
  HABIT_DONE: 10,
  JOURNAL_ENTRY: 30,
  GOAL_UPDATE: 15,
  FOCUS_SESSION: 25,
}

// Level thresholds: level = floor(xp / 100) + 1, capped at 50
export function getLevel(xp: number): number {
  return Math.min(Math.floor(xp / 100) + 1, 50)
}

export function getXpToNextLevel(xp: number): number {
  var level = getLevel(xp)
  var nextLevelXp = level * 100
  return nextLevelXp - xp
}

export function getXpProgress(xp: number): number {
  var xpInCurrentLevel = xp % 100
  return xpInCurrentLevel
}

export function getLevelTitle(level: number): string {
  if (level < 3) return 'Beginner'
  if (level < 5) return 'Explorer'
  if (level < 8) return 'Builder'
  if (level < 12) return 'Achiever'
  if (level < 16) return 'Champion'
  if (level < 21) return 'Master'
  if (level < 30) return 'Legend'
  return 'Grandmaster'
}

// All badge definitions
export var BADGES = [
  { id: 'first_checkin', name: 'First Step', description: 'Complete your first check-in', icon: '🎯', color: 'from-green-500 to-emerald-500', xp: 50 },
  { id: 'checkin_7', name: 'Consistent', description: 'Check in 7 days in a row', icon: '📅', color: 'from-blue-500 to-cyan-500', xp: 100 },
  { id: 'checkin_30', name: 'Dedicated', description: 'Check in 30 times total', icon: '🏆', color: 'from-yellow-500 to-orange-500', xp: 300 },
  { id: 'first_journal', name: 'Storyteller', description: 'Write your first journal entry', icon: '📖', color: 'from-indigo-500 to-purple-500', xp: 50 },
  { id: 'journal_10', name: 'Chronicle', description: 'Write 10 journal entries', icon: '📚', color: 'from-purple-500 to-pink-500', xp: 150 },
  { id: 'journal_30', name: 'Novelist', description: 'Write 30 journal entries', icon: '✍️', color: 'from-pink-500 to-rose-500', xp: 400 },
  { id: 'habit_7', name: 'Week Warrior', description: 'Maintain a habit for 7 days', icon: '🔥', color: 'from-orange-500 to-red-500', xp: 100 },
  { id: 'habit_30', name: 'Month Master', description: 'Maintain a habit for 30 days', icon: '💪', color: 'from-red-500 to-pink-500', xp: 500 },
  { id: 'first_focus', name: 'In The Zone', description: 'Complete your first focus session', icon: '⚡', color: 'from-cyan-500 to-blue-500', xp: 50 },
  { id: 'focus_10h', name: 'Deep Work', description: 'Accumulate 10 hours of focus time', icon: '🧠', color: 'from-teal-500 to-cyan-500', xp: 200 },
  { id: 'goal_50', name: 'Halfway There', description: 'Reach 50% on any goal', icon: '🎯', color: 'from-violet-500 to-purple-500', xp: 75 },
  { id: 'goal_100', name: 'Goal Crusher', description: 'Complete a goal to 100%', icon: '🏅', color: 'from-yellow-400 to-orange-500', xp: 250 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', color: 'from-yellow-500 to-amber-500', xp: 0 },
  { id: 'level_10', name: 'Life Master', description: 'Reach level 10', icon: '🌟', color: 'from-amber-400 to-yellow-300', xp: 0 },
  { id: 'early_bird', name: 'Early Bird', description: 'Check in before 7 AM', icon: '🌅', color: 'from-orange-400 to-yellow-400', xp: 75 },
  { id: 'night_owl', name: 'Night Owl', description: 'Check in after 10 PM', icon: '🌙', color: 'from-indigo-600 to-purple-600', xp: 75 },
]

// Award XP and check for new badges
export async function awardXP(userId: string, amount: number, currentXp: number, currentBadges: string[], extraChecks?: { type: string; data: Record<string, unknown> }): Promise<{ newXp: number; newLevel: number; newBadges: string[]; leveledUp: boolean }> {
  var newXp = currentXp + amount
  var oldLevel = getLevel(currentXp)
  var newLevel = getLevel(newXp)
  var leveledUp = newLevel > oldLevel
  var newBadges = [...currentBadges]

  // Check for level-based badges
  if (newLevel >= 5 && !newBadges.includes('level_5')) newBadges.push('level_5')
  if (newLevel >= 10 && !newBadges.includes('level_10')) newBadges.push('level_10')

  // Check time-based badges if checking in
  if (extraChecks?.type === 'checkin') {
    var hour = new Date().getHours()
    if (hour < 7 && !newBadges.includes('early_bird')) newBadges.push('early_bird')
    if (hour >= 22 && !newBadges.includes('night_owl')) newBadges.push('night_owl')
  }

  await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel, badges: newBadges })
    .eq('id', userId)

  return { newXp, newLevel, newBadges, leveledUp }
}

// Check and award achievement badges based on counts
export async function checkAndAwardBadges(userId: string, currentBadges: string[], counts: { checkins?: number; journals?: number; maxHabitStreak?: number; focusMinutes?: number; maxGoalProgress?: number }): Promise<string[]> {
  var newBadges = [...currentBadges]
  var { checkins = 0, journals = 0, maxHabitStreak = 0, focusMinutes = 0, maxGoalProgress = 0 } = counts

  if (checkins >= 1 && !newBadges.includes('first_checkin')) newBadges.push('first_checkin')
  if (checkins >= 30 && !newBadges.includes('checkin_30')) newBadges.push('checkin_30')
  if (journals >= 1 && !newBadges.includes('first_journal')) newBadges.push('first_journal')
  if (journals >= 10 && !newBadges.includes('journal_10')) newBadges.push('journal_10')
  if (journals >= 30 && !newBadges.includes('journal_30')) newBadges.push('journal_30')
  if (maxHabitStreak >= 7 && !newBadges.includes('habit_7')) newBadges.push('habit_7')
  if (maxHabitStreak >= 30 && !newBadges.includes('habit_30')) newBadges.push('habit_30')
  if (focusMinutes >= 25 && !newBadges.includes('first_focus')) newBadges.push('first_focus')
  if (focusMinutes >= 600 && !newBadges.includes('focus_10h')) newBadges.push('focus_10h')
  if (maxGoalProgress >= 50 && !newBadges.includes('goal_50')) newBadges.push('goal_50')
  if (maxGoalProgress >= 100 && !newBadges.includes('goal_100')) newBadges.push('goal_100')

  if (newBadges.length !== currentBadges.length) {
    await supabase.from('profiles').update({ badges: newBadges }).eq('id', userId)
  }

  return newBadges
}
