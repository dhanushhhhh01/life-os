# Life OS 3D Animation Website - Complete Build Prompt

## Vision
Create an **interactive 3D animated website** for Life OS that transforms the traditional dashboard into an immersive, gamified personal development environment. Users navigate a digital world where:
- Goals are represented as mountains to climb
- Habits are shown as daily rituals in an animated environment
- Mood check-ins visualize emotional state through color/weather
- Journal entries manifest as collected artifacts or memories
- The AI Coach (Dex) appears as an animated companion

## Tech Stack
- **Frontend**: Next.js 16.2.1 + React
- **3D Engine**: Three.js or Babylon.js
- **Animation**: Gsap, Framer Motion
- **Backend**: Supabase (existing, reuse)
- **AI**: Claude Haiku 3.5 via Anthropic API (Dex agent)
- **Deployment**: Vercel

---

## Core Sections & 3D Concepts

### 1. Landing Page - 3D Hero Experience
**Concept**: Animated digital landscape with parallax scrolling and interactive 3D elements

**Features**:
- Rotating 3D globe with "Berlin" location highlighted
- Animated particles representing goals, habits, and growth
- Interactive 3D text that responds to mouse movement
- Smooth scroll reveals 3D mission statement sections
- CTA button launches into the main dashboard with smooth 3D transition

**Assets Needed**:
- 3D globe model (Free from Sketchfab or Three.js library)
- Particle system for background
- Animated typography (Three.js text geometry)

---

### 2. Dashboard - 3D Digital World
**Concept**: An isometric 3D world that evolves as you progress

**Elements**:

#### a) Central Hub (Isometric View)
- A digital island/floating platform as the home base
- Dex's character standing as an animated NPC (waits for interaction)
- Four directional paths leading to different sections:
  - **North**: Goals Mountain Range
  - **East**: Habits Garden
  - **South**: Journal Library
  - **West**: Mood Observatory

#### b) Goals Mountain Range (3D Diorama)
**Representation**:
- Each goal = a mountain/peak with different heights based on progress
- Progress bar = visible climbing trail up the mountain
- Completed goals = glowing summit with flag planted
- Unstarted goals = misty, untouched peaks

**Interaction**:
- Click mountain → see goal details and create new goal
- Drag to update progress
- Animated characters climbing (visual representation of progress)

#### c) Habits Garden (3D Garden Scene)
**Representation**:
- Each habit = a plant/tree that grows with consistency
- Fully grown plants = blooming flowers (completed daily habits)
- Wilted plants = broken streaks (visual warning)
- Garden "health" meter shows overall habit consistency

**Interaction**:
- Click plant → log habit as complete (tree blooms with animation)
- See streak counter on each plant
- Collect daily bonus (animated reward particle burst)

#### d) Mood Observatory (3D Visualization)
**Representation**:
- Central chamber with dynamic weather/lighting
- Mood level = sky color and weather state:
  - Happy (9-10): Sunny, bright blues, butterflies
  - Good (7-8): Partly cloudy, comfortable
  - Neutral (5-6): Overcast, gray
  - Low (3-4): Rainy, dark clouds
  - Stressed (1-2): Thunderstorm, intense effects
- Energy level = landscape brightness and activity level
- Animated mood history chart (3D bar chart or particle graph)

**Interaction**:
- Click to update mood/energy → sky transforms with smooth animation
- See 7-day mood trend visualization
- Dex comments on mood patterns

#### e) Journal Library (3D Book Shelf)
**Representation**:
- A magical library with floating books
- Each journal entry = an animated book that floats/rotates
- Book colors represent mood/category at time of writing
- Books organized chronologically on shelves that extend infinitely upward
- Particle effects when browsing entries

**Interaction**:
- Click book → read entry with page-flip animation
- New entry → book materializes with magical effect
- Search/filter entries → books reorganize smoothly

---

### 3. Dex AI Coach - 3D Character & Interaction
**Concept**: Animated AI companion that responds to user input

**Features**:
- **Model**: Low-poly 3D character (stylized, not realistic) - consider avatar builder
- **Animations**:
  - Idle pose (waiting for interaction)
  - Listening pose (when user types)
  - Celebrating pose (for achievements)
  - Concerned pose (for warnings/risks)
  - Thinking pose (while processing response)
- **Chat Interface**: 3D floating chat bubble above character
- **Eye Contact**: Character looks at user when speaking
- **Gesture**: Hand gestures emphasize important points
- **Context-Aware**: Dex reacts to location (mountain for goals, garden for habits, etc.)

**Dex Behaviors**:
- Celebrates goal progress with jump/dance animations
- Encourages habit completion with thumbs up
- Shows concern for low mood with comforting gesture
- Congratulates streaks with confetti particle effects
- Proactive advice appears as floating text near Dex

---

## Advanced Features

### 1. Progression System
- **Level Progression**: Visual 3D level-up animation with particles
- **Unlock New Areas**: As level increases, new 3D environments unlock
  - Level 5: Unlock "Internship Quest" dimension
  - Level 10: Unlock "German Mastery Tower"
  - Level 20: Unlock "Berlin Tech Hub" collaboration space

### 2. Achievements Gallery (3D Hall of Fame)
- Floating achievement badges in 3D space
- Badges glow and animate when unlocked
- Categories: Streaks, Goals Completed, Mood Consistency, Habit Mastery

### 3. Social Features (Optional)
- 3D profile avatar customization
- Friend island visits (multiplayer 3D world view)
- Leaderboard visualization (3D tower height comparison)

### 4. Mobile Responsive
- Adapt 3D scenes for mobile (lower poly, simplified animations)
- Touch gestures for interaction (tap to navigate, swipe for menu)
- Gyroscope support for parallax on mobile

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Three.js/Babylon.js scene with basic camera/controls
- [ ] Create 3D landing page with parallax and interactive elements
- [ ] Build isometric 3D hub world
- [ ] Connect to existing Supabase data

### Phase 2: Core Sections (Week 3-4)
- [ ] Build 3D Goals Mountain Range with progress visualization
- [ ] Build 3D Habits Garden with growth mechanics
- [ ] Build Mood Observatory with weather system
- [ ] Build Journal Library with book visualization

### Phase 3: AI Integration (Week 5)
- [ ] Create Dex 3D character model and rig
- [ ] Implement animation states (idle, listening, celebrating, etc.)
- [ ] Connect Dex to Claude API for intelligent responses
- [ ] 3D chat interface with character animations

### Phase 4: Polish & Optimization (Week 6)
- [ ] Particle effects (achievement rewards, mood changes, etc.)
- [ ] Audio design (ambient music, sound effects for interactions)
- [ ] Performance optimization (LOD, culling, mobile support)
- [ ] Accessibility (keyboard nav, screen reader support)

---

## Component Architecture

```
LifeOS3D/
├── pages/
│   ├── index.tsx (3D Landing)
│   ├── dashboard.tsx (Main 3D world)
│   └── goals.tsx (Goals mountain detail)
├── components/
│   ├── 3D/
│   │   ├── Scene.tsx (Main Three.js scene)
│   │   ├── Hub.tsx (Isometric central hub)
│   │   ├── GoalsMountain.tsx
│   │   ├── HabitsGarden.tsx
│   │   ├── MoodObservatory.tsx
│   │   ├── JournalLibrary.tsx
│   │   ├── DexCharacter.tsx (AI companion)
│   │   └── ParticleSystem.tsx
│   ├── UI/
│   │   ├── ChatBubble.tsx
│   │   ├── Stats.tsx
│   │   └── Menu.tsx
│   └── Animations/
│       ├── transitions.ts
│       └── character.ts
├── lib/
│   ├── three-helpers.ts
│   ├── supabase.ts
│   └── dex-api.ts
└── styles/
    └── 3d.css
```

---

## Key Implementation Details

### 3D Camera Controls
```typescript
// Smooth camera transitions between zones
camera.position.lerp(targetPosition, 0.05);
camera.lookAt(targetLookAt);
```

### Goal Progress Visualization
```typescript
// Mountain height = progress percentage
mountainMesh.scale.y = progress / 100 * maxHeight;
// Animated climbing trail
trailParticles.emit(climbingRate);
```

### Mood Weather System
```typescript
const moodToWeather = {
  1-2: { skyColor: '#1a1a2e', weatherType: 'thunderstorm' },
  3-4: { skyColor: '#2d3436', weatherType: 'rain' },
  5-6: { skyColor: '#636e72', weatherType: 'cloudy' },
  7-8: { skyColor: '#74b9ff', weatherType: 'partly-cloudy' },
  9-10: { skyColor: '#00b4d8', weatherType: 'sunny' }
};
```

### Dex Character Animation States
```typescript
enum DexState {
  Idle = 'idle',
  Listening = 'listening',
  Celebrating = 'celebrating',
  Concerned = 'concerned',
  Thinking = 'thinking'
}
```

---

## Design Inspiration Sources
- **Spaceplan.app** - Incremental game with beautiful 3D aesthetic
- **Duolingo** - Gamification and character animation
- **Journey** - Emotional 3D landscape design
- **Animal Crossing** - Cozy 3D world that feels alive
- **Monument Valley** - Impossible geometry and perspective play

---

## Success Metrics
- 60 FPS on desktop, 30+ FPS on mobile
- Sub-2s load time for dashboard
- 90+ Lighthouse performance score
- User engagement: 5+ min average session (up from current 2-3 min)
- Habit completion rate increases 20%+ from gamification

---

## Deployment
- Build static export + dynamic API routes on Vercel
- Use Vercel Analytics to track 3D rendering performance
- CDN-delivered assets (textures, models) for fast load
- Progressive enhancement: fallback to 2D dashboard on low-end devices

---

**Next Step**: Start Phase 1 with Three.js scene setup and 3D landing page. This will be the most immersive personal development tool ever built for Berlin's AI community.
