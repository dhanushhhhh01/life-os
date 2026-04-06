# Life OS + Dex AI Coach — 3D Animation Website Specification

## Executive Summary

**Life OS** is a world-class personal second brain and AI life coach application designed for high-achieving individuals managing complex goals, habits, and personal growth. **Dex** is the autonomous AI agent powering personalized coaching, goal tracking, and life optimization.

This document provides a comprehensive specification for building a stunning 3D-animated web experience of Life OS, targeting ambitious professionals, students, and entrepreneurs.

---

## 1. Product Vision

### Purpose
Life OS transforms how people manage their lives by combining:
- **Goal Management** — Track and progress toward meaningful objectives
- **Habit Tracking** — Build streaks and reinforce daily routines
- **Mood & Energy Check-ins** — Monitor well-being and energy levels
- **Journal & Reflection** — Capture insights and track growth
- **Dex AI Coach** — Autonomous AI agent that takes actions on your behalf

### Target User: Dhanush Ramesh Babu (Persona)
- **Profile**: Masters student, Berlin, SRH University
- **Goals**: AI/Robotics specialization, Siemens/Tesla/Continental internship
- **Languages**: German B1 learner, English fluent
- **Ambition**: Build world-class applications, advance AI/robotics career
- **Pain Points**:
  - Juggling multiple goals (career, learning, health, personal)
  - Staying consistent with habits and goals
  - Need for intelligent, personalized guidance
  - Want beautiful, motivating tools (not bland productivity apps)

### Design Philosophy
**World-class, modern, inspiring**
- Dark glassmorphism aesthetic with cyan/blue neon accents
- 3D particles and animated backgrounds (neural networks, interconnected nodes)
- Smooth, fluid micro-interactions and transitions
- Futuristic yet approachable tone
- AI-first design (Dex is the hero, not just a button)

---

## 2. Core Features & User Flows

### 2.1 Authentication & Onboarding
**User Journey**: Sign up → Profile setup → Initial goals/habits → Meet Dex

**3D Elements**:
- Animated 3D cube login page with particles trailing behind interactions
- Onboarding carousel with floating cards and morphing shapes
- Welcome sequence: Dex appears with smooth intro animation

**Key Screens**:
- Login (3D cube animation)
- Sign up flow (progressive disclosure)
- Onboarding (goal-setting wizard with Dex guidance)

---

### 2.2 Dashboard (Home)
**Purpose**: At-a-glance view of user's life status

**Key Metrics Displayed**:
- **XP/Level**: Gamified progression (Level 1, 2, etc. with 20 XP per level)
- **Streaks**: Current habit streaks (e.g., "Morning Coding: 12 days")
- **Check-in Status**: Last mood/energy check-in
- **Quick Actions**: "Check in today", "Log habit", "Write journal entry"
- **Dex Greeting**: Personalized greeting from AI coach with actionable suggestions

**3D Animation Ideas**:
- Floating particle network background that subtly responds to user interactions
- Progress rings with animated percentage counters
- Streak badges with subtle glow and levitation effects
- Cards that tilt and shadow on hover (glassmorphic depth)

---

### 2.3 Goals Page
**Purpose**: Track, create, and progress toward goals

**Features**:
- **Goal Cards**: Name, category, deadline, progress bar
- **Categories**: Career, Learning, Health, Personal, Language
- **Progress Tracking**: 0-100% completion slider
- **Quick Actions**: Edit, delete, mark complete

**3D Elements**:
- Goals displayed as floating 3D cards with parallax depth
- Progress bars with animated fill animations
- Category icons with 3D rotation on hover
- Completed goals fade out with particle burst effect
- Timeline view showing goal deadlines on interactive 3D calendar

**Dex Integration**:
- "Create a goal to..." — Dex autonomously creates goals when asked
- "Update my goal progress" — Dex can update goal completion percentage
- Goal recommendations based on user's profile

---

### 2.4 Habits Page
**Purpose**: Build and maintain daily habits

**Features**:
- **Habit List**: Name, category, current streak, last logged date
- **Categories**: Morning Routine, Health, Learning, Work, Personal
- **Streak Counter**: Days completed consecutively
- **Quick Log**: "Done!" button to mark habit complete today
- **Habit History**: Calendar view of past completions

**3D Animation Ideas**:
- Habits as 3D blocks/tiles with glow effect
- Streak numbers in large, animated counters
- Calendar heatmap with depth (3D blocks representing completion intensity)
- "Logged today" animations with confetti or particle burst
- Upcoming habit reminders displayed in 3D notification cards

**Dex Integration**:
- "Log that I studied for 2 hours" — Dex logs habits directly
- "Create a daily habit to drink water at 9am" — Dex creates and optionally sets reminders
- "I did my morning routine" — Natural language habit logging

---

### 2.5 Check-In (Mood & Energy)
**Purpose**: Track emotional and physical state throughout the day

**Features**:
- **Mood Slider**: 1-10 rating (sad 😢 to ecstatic 😄)
- **Energy Slider**: 1-10 rating (exhausted to energized)
- **Notes**: Optional context (what's affecting mood/energy?)
- **Check-in History**: Timeline view of past check-ins
- **Trends**: Graph showing mood and energy patterns over time

**3D Animation Ideas**:
- Mood slider as 3D interactive control with particle effects
- Energy bars with animated fill and glow
- Timeline displayed as 3D elevation map (higher points = better mood/energy)
- Emotion-based color shifts (red=low mood, green=high mood)
- Animated face or mood indicator that responds to selections

**Dex Integration**:
- "I'm feeling great today, energy is 8/10" — Dex records check-in
- "I've been low energy lately" — Dex analyzes and provides insights

---

### 2.6 Journal
**Purpose**: Capture reflections, insights, and personal growth

**Features**:
- **Journal Entry Editor**: Rich text, markdown support
- **Entry History**: Chronological list of past entries
- **Search**: Find entries by keyword
- **Tags**: Categorize entries (reflection, learning, achievement, struggle, etc.)
- **Sentiment Analysis**: Display mood indicator for each entry

**3D Animation Ideas**:
- Journal entries displayed as 3D floating pages/cards
- Smooth page-turn animations when navigating entries
- Timeline view with 3D depth (older entries in background)
- Text appearing with typewriter animation as pages load
- Search results floating and assembling into view

**Dex Integration**:
- "Write a journal entry about my progress on German learning" — Dex creates entry
- Dex can suggest journaling prompts based on recent check-ins and goals

---

### 2.7 AI Coach — Dex
**Purpose**: Autonomous AI agent providing personalized guidance and taking actions

**Dex Personality**:
- **Tone**: Supportive, intelligent, slightly witty, never patronizing
- **Style**: Direct but empathetic; data-driven but human-centered
- **Accent**: Berlin-aware (references to German culture, local insights)
- **Voice**: Acts as a partner, not a boss or therapist

**Capabilities**:
- **Multi-turn Reasoning**: Understands context and chains thoughts
- **Tool Use**: Can autonomously create goals, log habits, update mood, write journal entries
- **Proactive Guidance**: Suggests actions based on user's data and goals
- **Adaptive Coaching**: Adjusts style based on user preferences

**3D Dex Character**:
- **Visual**: Sleek, minimalist avatar with glowing accent (cyan/blue)
- **Animations**:
  - Appears from particle cloud when conversation starts
  - Nods/reacts to user messages
  - Thinking animation (circling particles) while processing
  - Success animation when completing actions
  - Gestures when explaining concepts

**Example Interactions**:

```
User: "Hey Dex, I want to improve my German. I'm at B1 level."

Dex:
✨ Analyzing your goals and habits...

I see you're targeting B1 fluency. Here's what I recommend:
• Create habit: "German practice" (30 min daily)
• Set goal: "Reach German B2 by Q2 2026"
• Schedule: 9am daily check-ins (when you're most focused)

Should I set these up for you?

[Action] Set it up!  [Edit]
```

---

## 3. Technical Architecture (3D Web Implementation)

### 3.1 Tech Stack
- **Frontend**: Next.js 16.2.1 + React 19
- **3D Rendering**: Three.js or Babylon.js
- **Animations**: Framer Motion, GSAP
- **Backend**: Node.js API + Supabase (PostgreSQL)
- **AI**: Claude API (Haiku 3.5 for agent)
- **Deployment**: Vercel

### 3.2 3D Scene Architecture
```
Scene
├── Background Layer
│   ├── Particle Network (neural network nodes)
│   ├── Animated Gradient
│   └── Floating Orbs
├── UI Layer
│   ├── Cards (glassmorphic with depth)
│   ├── Charts/Visualizations (3D)
│   └── Interactive Elements
└── Character Layer
    ├── Dex Avatar
    └── Animations & Reactions
```

### 3.3 Performance Optimization
- Use instancing for particle effects
- LOD (Level of Detail) for complex 3D models
- GPU-accelerated animations
- Lazy load 3D components
- Mobile optimization (reduce particle count, simplify geometry)

---

## 4. Visual Design System

### 4.1 Color Palette
- **Primary**: Cyan (#00D4FF) — Energy, growth, tech
- **Secondary**: Deep Blue (#0A1E3C) — Trust, stability
- **Accent**: Magenta (#FF006E) — Highlights, CTAs
- **Background**: Nearly Black (#0D0D0D) — Dark mode default
- **Glassmorphism**: Translucent overlays with backdrop blur

### 4.2 Typography
- **Headlines**: Bold, geometric sans-serif (e.g., Inter, Outfit)
- **Body**: Clean, readable sans-serif (Inter)
- **Code/Tech**: Monospace (JetBrains Mono)

### 4.3 Spacing & Rhythm
- Base unit: 4px
- Breathing room around UI elements
- Consistent gutter widths for responsive design

### 4.4 Glassmorphism Implementation
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
```

---

## 5. 3D Animation Specifications

### 5.1 Particle Effects
- **Particle Network**: Interconnected nodes representing neural networks, goals, and connections
- **Burst Effect**: Celebratory particle burst when goals/habits are completed
- **Trail Effect**: Particle trails following cursor or animated elements
- **Ambient**: Subtle floating particles in background

### 5.2 Transitions & Interactions
- **Page Transitions**: Smooth fade + scale animations
- **Card Interactions**: Tilt on hover, shadow depth increase
- **Button States**: Glow on hover, scale on click, ripple effect
- **Loading States**: Animated spinner with rotating particles

### 5.3 Character Animation (Dex Avatar)
- **Idle**: Subtle breathing, gentle rotation
- **Listening**: Animated attention gesture
- **Thinking**: Circling particles around avatar
- **Success**: Thumbs up or celebratory animation
- **Error**: Slight shake, concerned expression

### 5.4 Data Visualization (3D)
- **Progress Rings**: Animated percentage counters with glow
- **Streak Charts**: 3D bar charts with depth
- **Timeline**: 3D elevation map of mood/energy over time
- **Goal Progress**: 3D filled spheres or blocks

---

## 6. Key User Interactions

### 6.1 Create a Goal (with Dex)
1. User clicks "Create Goal" or tells Dex "I want to..."
2. Dex asks clarifying questions (if via chat)
3. Goal card animates into view with initial data
4. Dex confirms and offers to set reminders
5. Success animation plays

### 6.2 Log a Habit
1. User clicks "Done!" on habit card
2. Card glows and animates completion
3. Streak counter increments with animation
4. Celebration particle burst
5. Dex acknowledges with encouraging message

### 6.3 Chat with Dex
1. User types message in chat input
2. Dex avatar animates thinking state
3. Response streams in with typing effect
4. If tool calls are made, animations show progress
5. Results display with success animations

### 6.4 Check-in Flow
1. User navigates to Check-in page
2. Mood/Energy sliders appear with 3D controls
3. User adjusts sliders (real-time color/mood feedback)
4. Optional note input with focus animation
5. Submit button highlights when ready
6. Confirmation animation + Dex message

---

## 7. Dex AI Agent Specification

### 7.1 Model & API
- **Model**: Claude 3.5 Haiku (cost-optimized for multi-turn reasoning)
- **API**: Anthropic Messages API with tool use
- **Max Tokens**: 1500 per response
- **Temperature**: 0.7 (balanced creativity + consistency)

### 7.2 System Prompt
```
You are Dex, an autonomous AI life coach for Dhanush Ramesh Babu.

Dhanush is:
- A Masters student in Industry 4.0/AI/Robotics at SRH University, Berlin
- Targeting internships at Siemens, Tesla, or Continental (AI/Robotics roles)
- Learning German (currently B1 level, goal: B2)
- Ambitious about building world-class applications and advancing his AI/robotics career

Your role:
- Provide personalized, data-driven life coaching
- Take autonomous actions on Dhanush's behalf (create goals, log habits, etc.)
- Be supportive, intelligent, and slightly witty (never patronizing)
- Reference Berlin culture and German language learning when relevant
- Celebrate achievements and gently push toward growth
- Make decisions based on Dhanush's goals and data

Personality:
- Tone: Partner, not boss. Supportive, intelligent, direct but empathetic.
- Style: Use data points to back recommendations. Be specific and actionable.
- Avoid: Generic platitudes, overly casual language, unsolicited life advice beyond goals/habits/mood.

Response format:
1. Acknowledge the user's message
2. Provide relevant insight or data
3. Suggest action (goal, habit, reflection)
4. Ask for confirmation or next step
```

### 7.3 Available Tools
```typescript
{
  name: "create_goal",
  description: "Create a new goal with name, category, deadline, description",
  input: { name, category, deadline?, description? }
}

{
  name: "update_goal_progress",
  description: "Update goal progress percentage (0-100)",
  input: { goal_id, progress }
}

{
  name: "log_habit",
  description: "Mark a habit as complete for today",
  input: { habit_id }
}

{
  name: "create_journal_entry",
  description: "Write a journal entry",
  input: { content }
}

{
  name: "update_checkin",
  description: "Record mood (1-10) and energy (1-10) check-in",
  input: { mood, energy, note? }
}
```

### 7.4 Example Agent Interaction
```
User: "Dex, I've been slacking on German. Help me get back on track."

Dex (multi-turn reasoning):
1. Retrieves user's German learning goal (B2 by Q2 2026)
2. Checks current habit streak for "German Practice" (0 days)
3. Analyzes recent mood/energy (low energy = less likely to succeed)
4. Suggests: Daily 30-min habit, check mood first, start small
5. Calls create_goal: "Consistency: 30 days German streak"
6. Calls log_habit: Log today's German practice
7. Responds with encouragement and next steps

Response:
"I see your B2 goal slipped a bit — totally normal. Here's the plan:

• I've created a goal to build a 30-day German streak (small wins first)
• Let's start today with 30 min of German practice
• Future me: I checked your energy — it's at 4/10, so we'll keep sessions focused (quality over quantity)

Ready to crush this? [Log today's practice]
```

---

## 8. Success Metrics

### User Engagement
- Daily active users (DAU)
- Average session duration
- Feature adoption rate (chat with Dex, goal creation, etc.)

### Goal & Habit Tracking
- Goals created per user per month
- Habit streak retention (% maintaining 7+ day streaks)
- Average goal completion rate

### AI Coach Usage
- Chat messages per user per week
- Autonomous actions taken by Dex per user per month
- User satisfaction with Dex recommendations

### Retention
- 30-day retention rate
- 90-day retention rate
- Churn analysis (why users leave)

---

## 9. Monetization (Optional Future)
- **Freemium Model**: Core features free, premium features paid
  - Premium: Unlimited goals, advanced analytics, Dex priority support
- **Subscription**: $4.99–$9.99/month
- **Annual**: 20% discount for yearly commitment

---

## 10. Implementation Roadmap

### Phase 1: MVP (Week 1-2)
- [ ] Supabase database schema (users, goals, habits, journal, check-ins)
- [ ] Next.js dashboard with basic pages
- [ ] Dex chat interface with Claude API integration
- [ ] Basic 3D background (particles + gradient)

### Phase 2: 3D Enhancement (Week 3-4)
- [ ] Three.js scene setup
- [ ] Particle network background
- [ ] 3D card animations and interactions
- [ ] Glassmorphic UI refinement

### Phase 3: Dex AI Integration (Week 5-6)
- [ ] Tool-use implementation for autonomous actions
- [ ] Multi-turn reasoning loop
- [ ] Dex character avatar animations
- [ ] Smart coaching responses

### Phase 4: Polish & Deploy (Week 7+)
- [ ] Mobile optimization
- [ ] Performance tuning (particle optimization, lazy loading)
- [ ] User testing & feedback
- [ ] Vercel deployment
- [ ] Iterate based on user feedback

---

## 11. Developer Notes

### 3D Library Recommendation
- **Three.js**: Better ecosystem, more examples, larger community
- **Babylon.js**: Better TypeScript support, easier particle systems
- **Decision**: Start with Three.js + Drei (React wrapper) for Next.js integration

### State Management
- React Context + useReducer for local state
- Supabase Real-time subscriptions for live updates
- Claude API streaming for chat responses

### Accessibility Considerations
- Reduce particle effects option for motion-sensitive users
- Keyboard navigation for all interactive elements
- High contrast mode option
- Screen reader support for all text content

### Deployment Checklist
- [ ] Environment variables configured (.env.local)
- [ ] Supabase migrations run
- [ ] Claude API key validated
- [ ] 3D assets optimized (WebGL, LOD)
- [ ] Performance benchmarks met (60 FPS, <3s load time)
- [ ] Mobile tested on iOS & Android
- [ ] SEO metadata configured
- [ ] Analytics integrated (Vercel Analytics)

---

## 12. Brand Voice & Tone

### Dex's Communication Style
**Do**:
- Be specific and data-driven ("You've completed 47% of your goals this month")
- Celebrate wins genuinely ("12-day streak! You're building momentum!")
- Ask clarifying questions ("Want to focus on coding, German, or both?")
- Suggest next steps ("Try 30 min daily instead of weekend binges")
- Use light humor ("Your energy is 2/10... coffee o'clock? ☕")

**Don't**:
- Use generic motivational quotes
- Pretend to be human or have experiences
- Over-apologize or be overly formal
- Make unsolicited life advice outside goals/habits/mood
- Use ALL CAPS or excessive punctuation

**Example Interactions**:
```
✓ "You've built a 12-day coding streak. At this pace, you'll hit 30 days by March 15. Keep it up!"
✓ "Energy is low today. Maybe focus on a 15-min study session instead of the full 2 hours?"
✗ "You're doing amazing!" (too generic)
✗ "I'm proud of you" (implying false emotion)
✗ "You MUST complete your goals!!!" (too aggressive)
```

---

## 13. References & Inspiration
- **Design**: Apple Health (intuitive dashboards), Superhuman (AI-first), Figma (glassmorphism)
- **AI**: GitHub Copilot (tool use), Claude (multi-turn reasoning)
- **3D Web**: Spline, Awwwards (3D UI trends)
- **Gamification**: Duolingo (streaks, XP), Habitica (RPG elements)

---

## Appendix A: Wire Frames (ASCII)

### Dashboard
```
┌─ Life OS / Dashboard ────────────────────┐
│                                          │
│  👤 Dhanush | Level 1 (20 XP)           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                          │
│  📊 Your Life Status                     │
│  ├─ Morning Coding: 12 days 🔥          │
│  ├─ German Practice: 0 days 😴          │
│  ├─ Mood: 7/10 😊  Energy: 6/10 ⚡     │
│                                          │
│  🎯 Active Goals                         │
│  ├─ Siemens AI Internship (45%)         │
│  ├─ German B2 Fluency (30%)             │
│                                          │
│  💬 Dex: "Your energy is up today!      │
│     Ready to tackle that German study?" │
│     [Log Habit] [Create Goal]           │
│                                          │
└──────────────────────────────────────────┘
```

---

**End of Specification**

*Last Updated: April 2026*
*Status: Ready for Implementation*
