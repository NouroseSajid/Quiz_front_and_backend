# 🎮 The Vibe Check — Game Strategy & Roadmap

## Executive Summary

**What You're Building:** A hybrid party game mixing trivia knowledge, estimation precision, creativity, and physical challenges. Think Kahoot + Taskmaster + GeoGuessr + Family Feud.

**Why It Works:** Variety prevents mental fatigue, social dynamics create memorable moments, and exponential scoring rewards both precision and confidence.

**Target:** 3–N players (optimized for 4–8)

**Platform:** Next.js frontend + Prisma/SQLite backend + WebSockets for real-time sync

---

## 🎯 Part 1: The Question Arsenal (Core Mechanics)

### Question Type Taxonomy

Your game supports **5 core types** plus **4 emerging types**. Each has distinct data structures, scoring logic, and UI patterns.

#### Core Type 1: Multiple Choice (MCQ)

**What It Is:** Classic A, B, C, D selection.

**Scoring Logic:**
- Correct answer = Base points (e.g., 1000)
- Time bonus applied (see Part 2)
- Wrong answer = 0 points

**UI Pattern:**
- 4 large card buttons
- Selection highlights immediately
- Cannot change after submission

**Database Fields:**
- `question.correct`: `"A"` or `"B"` (single letter)
- `question.metadata`: `{options: ["Option A", "Option B", "Option C", "Option D"]}`

**Why:** Familiar, fast, low friction.

---

#### Core Type 2: Range Ruler (The Estimation Slider)

**What It Is:** Drag a slider to estimate a value between Min and Max.

**Example:** "How many miles is the Moon from Earth?" (Correct: 238,900)

**Scoring Logic — Exponential Decay (Critical):**

```
error = abs(submitted - correct) / (max - min)  // 0-1 range

accuracy = e^(-error / tolerance)  // Exponential decay
          // tolerance usually 0.2 (20% error = 50% points)

points = basePoints * accuracy * timeBonus

Examples:
  - 5% error → 0.78 accuracy → 78% points
  - 20% error → 0.37 accuracy → 37% points
  - 50% error → 0.08 accuracy → 8% points
```

**Why Exponential?**
- Linear is too harsh (wrong by 1% or 20% feels the same)
- Exponential rewards "closeness" psychologically
- Keeps leaderboard tight (fun, not one-sided)

**UI Pattern:**
- Horizontal slider with live value display
- Min/Max labels
- Visual feedback (green = close, red = far)

**Database Fields:**
- `question.correct`: `{value: 238900}`
- `question.metadata`: `{min: 0, max: 500000, tolerance: 0.2}`

**When to Use:** Trivia that has numeric answers (distances, years, populations, percentages).

---

#### Core Type 3: String Up (Open Answer)

**What It Is:** Players type or type a number; system evaluates closeness.

**Two Subtypes:**

**3A — String Exact Match**
- Example: "Name a country starting with 'Z'."
- Correct: "Zambia", "Zimbabwe", "Zaire" (accept multiple)
- Scoring: Exact match = 1000 points, wrong = 0

**3B — Number Proximity**
- Example: "How many countries in Africa?"
- Correct: 54
- Uses same exponential decay as Range Ruler

**Scoring Logic:**
- Strings: Case-insensitive, trim whitespace, check against approved answers list
- Numbers: Exponential decay same as Type 2

**UI Pattern:**
- Text input field OR number input
- Submit button (can't change after)

**Database Fields:**
- `question.correct`: `{type: "string", values: ["Zambia", "Zimbabwe"]}` OR `{type: "number", value: 54}`
- `question.metadata`: `{tolerance: 0.15}` (for numeric types)

**When to Use:** Name things, estimate without slider interface, open-ended questions.

---

#### Core Type 4: GeoGuessr (Map Pin)

**What It Is:** Player clicks a world map; system scores by distance from correct location.

**Example:** "Where was the Colosseum built?" → Player pins Rome

**Scoring Logic — Distance-Based with Scope Scaling (Important):**

```
distance = haversineDistance(playerLat, playerLon, correctLat, correctLon)

// But: scaling matters!
// City-level question: 50km error = terrible
// World-level "Where is France?": 50km error = perfect

scopeRadius = {
  city: 5,        // km
  region: 50,     // km
  country: 200,   // km
  continent: 1000, // km
  world: 5000     // km
}

error = distance / scopeRadius[scope]
accuracy = e^(-error / tolerance)
points = basePoints * accuracy * timeBonus
```

**UI Pattern:**
- Interactive Leaflet/Mapbox map
- Click to place pin
- Confirmation before submit
- Show distance after scoring

**Database Fields:**
- `question.correct`: `{lat: 41.8902, lng: 12.4922}` (Rome)
- `question.metadata`: `{scope: "city", tolerance: 0.3, mapZoom: 4}`

**When to Use:** Geography, landmarks, historical locations.

---

#### Core Type 5: Taskmaster (Real-Life Challenge)

**What It Is:** Player completes a real-world task, then submits proof (photo/text/result).

**Examples:**
- Build a paper plane; measure throw distance in cm
- Make the fastest origami crane (time in seconds)
- Take a photo of something blue in your room
- Write a 5-word story about this image

**Scoring Logic — Dual Phase:**

**Phase 1 (Task Submission):**
- Text tasks: Auto-scored for word count, accuracy
- Photo tasks: All submissions shown in grid
- Physical results: Convert to quantitative metric (distance, time)

**Phase 2 (Voting):**
- All players see all submissions
- Vote for top 2 favorites (can't vote for self)
- Scoring: `(votes_received / total_voters) * basePoints`

**UI Pattern:**
- Task description + timer (e.g., 2 minutes)
- Submission form (text input OR photo upload)
- Voting grid after all submit
- Leaderboard calculates after voting

**Database Fields:**
- `question.type`: `"TASK"`
- `question.metadata`: `{taskType: "text" | "photo" | "physical", timeLimit: 120, votingFormatL "top2"}`
- `answer.submitted`: `{type: "text", value: "story here"}` OR `{type: "photo", url: "s3://..."}` OR `{type: "physical", result: "25cm"}`

**⚠️ MVP Warning:** Avoid video uploads in v1. Too slow. Photo + text + voting only.

---

#### Emerging Type 6: Consensus (The Vibe Mode)

**What It Is:** The correct answer is the group's collective response.

**Example:** "What % of this room drinks coffee?" → Correct = actual % who voted yes.

**Scoring Logic:**
- Players answer (e.g., slider 0–100%)
- System calculates group mean
- Players score based on distance from mean
- `accuracy = e^(-(abs(submitted - groupMean) / 50))`

**Why:** Pure vibe checking. Rewards predicting group psychology.

**UI Pattern:**
- Standard Range Ruler UI
- After all submit, show group average

**Database Fields:**
- `question.type`: "CONSENSUS"
- `question.metadata`: `{min: 0, max: 100, label: "%"}`

---

#### Emerging Type 7: Ranking Order

**What It Is:** Rank items in correct order.

**Example:** "Rank these countries by population (largest to smallest): China, India, USA, Indonesia, Brazil"

**Scoring Logic:**
- Each correctly-positioned item = basePoints / numItems
- Bonus: All correct = 50% bonus points

**UI Pattern:**
- Drag-and-drop list reordering
- Visual feedback on ranks
- Submit when done

**Database Fields:**
- `question.correct`: `["China", "India", "USA", "Indonesia", "Brazil"]`
- `question.metadata`: `{items: [...], criterion: "population"}`

---

#### Emerging Type 8: Hidden Reveal (Unblur Game)

**What It Is:** Image gets progressively clearer every 2 seconds. Answer early for high risk/reward.

**Example:** Blurred photo of celebrity → Become clearer → Player can answer at any clarity level

**Scoring Logic:**
```
clarityLevel = 0 (fully blurred) to 5 (fully clear)

riskReward = {
  1: 2.0x points,  // Insane difficulty
  2: 1.8x points,
  3: 1.5x points,
  4: 1.2x points,
  5: 1.0x points   // Safe
}

accuracy = isCorrect ? 1 : 0
points = basePoints * riskReward[clarityLevel] * accuracy
```

**UI Pattern:**
- Image displayed with progressive CSS filter unblur
- Timer countdown per level
- "Buzz in" button at any time
- MCQ options appear when you buzz

**Database Fields:**
- `question.media`: URL to full image
- `question.metadata`: `{revealSteps: 5, timePerStep: 2000}`

---

#### Emerging Type 9: Confidence Multiplier

**What It Is:** After answering, player sets confidence level. Double-or-nothing mechanic.

**Applied to:** Range Ruler, MCQ, String answers

**Scoring Logic:**
```
confidenceLevels = {
  safe: 1.0x,      // Normal points
  confident: 1.5x, // 50% bonus
  all_in: 2.0x     // Double or zero
}

finalPoints = basePoints * accuracy * confidenceMultiplier
```

**UI Pattern:**
- After answer submitted, show confidence slider
- Visual icons (cautious to risky)

**When to Use:** Late-game strategy mechanic (players manage risk).

---

#### Emerging Type 10: Buzzer Duel

**What It Is:** First player to buzz in gets a chance. If wrong, others can steal.

**Example:** "Which planet is closest to the sun?" → First buzzer chooses, if wrong, someone can steal.

**Scoring Logic:**
- First correct: 1000 pts
- Steal correct: 500 pts
- Wrong buzz: -200 pts (slight penalty to prevent spam)

**UI Pattern:**
- Large "BUZZ" button
- MCQ appears after buzz
- Steal button appears if answer wrong

**When to Use:** Fast-paced rounds, high energy.

---

## 🎭 Part 2: Gameplay Flow & Round Structure

### The Game State Machine (Your Source of Truth)

Every game follows this strict flow. **Never** deviate or let clients decide state.

```
┌─────────┐
│  LOBBY  │  Players join, host hits "Start"
└────┬────┘
     │
     ▼
┌──────────────┐
│ ROUND_START  │  Host announces round theme
└────┬─────────┘
     │
     ▼
┌─────────────────┐
│ QUESTION_ACTIVE │  Timer counts down, players answer
└────┬────────────┘
     │
     ▼
┌────────────────┐
│QUESTION_LOCKED │  No more submissions accepted
└────┬───────────┘
     │
     ▼
┌──────────────┐
│   SCORING    │  Calculate points, animate result
└────┬─────────┘
     │
     ▼
┌──────────────────┐
│  LEADERBOARD     │  Update scores, show drama
└────┬─────────────┘
     │
     ▼
┌────────────┐
│ NEXT_ROUND │  Loop back to ROUND_START
└────┬───────┘
     │
     ├─→ [More rounds?] → ROUND_START
     │
     └─→ [Game over?] → FINISHED
          │
          ▼
       ┌──────────┐
       │ FINISHED │  Final leaderboard, confetti
       └──────────┘
```

**Critical Rule:** Only the server can change state. Clients receive state updates via WebSocket, never dictate them.

---

### Round Structure (The Pacing Blueprint)

Each round follows this pattern:

```
Round Theme Announcement (5 seconds)
  ↓
Question Reveal (2 seconds)
  ↓
Player Input Phase (15–30 seconds, depends on type)
  ↓
Answer Locked (servers locks at timeLimit)
  ↓
Scoring Animation (3–5 seconds)
  ↓
Reveal Phase (Show all answers revealed anonymously)
  ↓
Leaderboard Shift (Animated score updates)
  ↓
Pause (3 seconds before next)
```

**Total per question: ~30–50 seconds**

**Total per round (5 questions): ~2.5–4 minutes**

**Typical game: 3 rounds = 7.5–12 minutes**

---

### Round Categories (Solve Input Fatigue)

Instead of random question types, group them:

#### Round 1: "The Precision Vibe" ⚡
- All Range Rulers or Map Pin questions
- Players get into "dragging/clicking" mode
- 5 questions
- Mental model: "Be accurate"

#### Round 2: "The Knowledge Vibe" 🧠
- All MCQ or Text exact match
- Players get into "recall" mode
- 5 questions
- Mental model: "Know the answer"

#### Round 3: "The Chaos Vibe" 🎨
- Mix of Taskmaster (photo/text), Consensus, Confidence, Buzzer
- Players get into "creative/social" mode
- 3–5 questions
- Mental model: "Go with your gut"

**Why This Works:**
- No constant mode-switching burnout
- Cognitive rhythm established
- Players improve as round progresses (they know what type to expect)

---

## 📊 Part 3: Scoring Math (The Engine)

### The Universal Scoring Formula

```
finalPoints = basePoints × accuracyMultiplier × timeMultiplier
```

---

### Accuracy Multiplier (Depends on Question Type)

#### Type 1 & 2 MCQ / Exact Match:
```
accuracyMultiplier = isCorrect ? 1.0 : 0.0
```

#### Type 3, 4, 7: (Range, Geo, Ranking — with error):
```
error = calculateError(submitted, correct)  // 0–1 range
tolerance = question.metadata.tolerance     // usually 0.15–0.25

accuracyMultiplier = e^(-error / tolerance)

Examples (tolerance=0.2):
  0% error (perfect)     → e^0        = 1.00 (100%)
  5% error               → e^-0.25    = 0.78 (78%)
  10% error              → e^-0.50    = 0.61 (61%)
  20% error              → e^-1.0     = 0.37 (37%)
  50% error              → e^-2.5     = 0.08 (8%)
  100% error             → e^-5.0     = 0.007 (0.7%)

This curve is magic:
  - Very close ≈ 80–90% points
  - Perfect = 100%
  - Way off = steep drop
```

#### Type 4 GeoGuessr (Distance-based):
```
distance_km = haversineDistance(playerLat, playerLon, correctLat, correctLon)

scopeRadius = {
  city: 5,
  region: 50,
  country: 200,
  continent: 1000,
  world: 5000
}

error = distance_km / scopeRadius[scope]
accuracyMultiplier = e^(-error / 0.3)  // 0.3 tolerance for geo
```

#### Type 5 Taskmaster (Voting):
```
votesReceived = count(votes FOR this answer)
totalVoters = count(all non-self voters)

accuracyMultiplier = votesReceived / totalVoters
```

---

### Time Multiplier (Reward Speed Without Harshness)

```
timeRemaining = (timeLimit - timeTaken)
timeRatio = timeRemaining / timeLimit

timeMultiplier = 1.0 + (timeRatio * 1.0)

Range: 1.0 (slow) to 2.0 (instant)

Examples (30 second timer):
  Answered in 1 sec   → 0.97 ratio  → 1.97x multiplier
  Answered in 10 sec  → 0.67 ratio  → 1.67x multiplier
  Answered in 20 sec  → 0.33 ratio  → 1.33x multiplier
  Answered in 29 sec  → 0.03 ratio  → 1.03x multiplier
  No answer           → 0 points (no multiplier)
```

**Why This Works:**
- Doesn't punish slow thinkers harshly
- Rewards quick decisions
- Smooth curve, no sudden cliffs

---

### Confidence Multiplier (Optional, Add Later)

Applied after accuracy + time:

```
confidenceLevel = player_choice  // "safe", "confident", "all_in"

confidenceMultiplier = {
  "safe": 1.0,
  "confident": 1.5,
  "all_in": 2.0
}

finalPoints = basePoints × accuracy × time × confidence
```

---

### Complete Example Calculation

**Question:** "How many miles to the Moon?" (Range Ruler)
- Base points: 1000
- Correct answer: 238,900
- Min/Max: 0–500,000
- Tolerance: 0.2
- Time limit: 30s

**Player 1:**
- Submitted: 250,000 miles
- Time taken: 5 seconds
- Error = |250,000 - 238,900| / 500,000 = 0.022 (2.2%)
- Accuracy = e^(-0.022/0.2) = e^(-0.11) = 0.896 (89.6%)
- Time multiplier = 1 + (25/30) = 1.833
- **Final: 1000 × 0.896 × 1.833 = 1,643 points** ✨

**Player 2:**
- Submitted: 150,000 miles
- Time taken: 28 seconds
- Error = |150,000 - 238,900| / 500,000 = 0.178 (17.8%)
- Accuracy = e^(-0.178/0.2) = e^(-0.89) = 0.411 (41.1%)
- Time multiplier = 1 + (2/30) = 1.067
- **Final: 1000 × 0.411 × 1.067 = 439 points**

**Leaderboard After Round 1:**
1. Player 1: 1,643 pts (close + fast)
2. Player 2: 439 pts (far + slow)

---

## 🏗️ Part 4: Technical Architecture

### The Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- Zustand (game state)
- Socket.io-client (real-time)
- React Leaflet (maps)
- Tailwind CSS (styling)

**Backend:**
- Next.js API Routes
- Socket.io server (separate Node.js process)
- Prisma ORM
- SQLite (dev), PostgreSQL (production)
- Upstash Redis (session/leaderboard caching)

**Infrastructure:**
- Vercel (frontend hosting)
- Railway or Heroku (backend/socket server)

---

### Critical Architecture Decisions

#### 1. Server-Authoritative Clock (MUST DO)

**Problem:** If server and client have different time, players get unfair advantage/disadvantage.

**Solution:**

Server broadcasts to all clients when question starts:
```json
{
  "type": "question:start",
  "questionId": "q123",
  "serverTime": 1708607400000,
  "duration": 30000
}
```

Client calculates remaining time locally:
```javascript
const timeLeft = Math.max(0,
  (startTime + duration) - Date.now()
);
```

Server validates submission:
```javascript
const actualTimeTaken = serverTime - clientSubmissionTime;
if (actualTimeTaken > duration) {
  // Reject or mark as late
  submission.pointsEarned = 0;
}
```

**Result:** No cheating, fair for all latencies.

---

#### 2. Real-Time State Sync (WebSockets)

**Architecture:**

```
┌─────────────────┐             ┌──────────────────┐
│  Player Client  │◄────────────┤  Socket.io Server│
│  (Next.js App)  │   Events    │  (Node.js)       │
└────────┬────────┘             └────────┬─────────┘
         │                               │
         │  Game state updates           │
         │  Question events              │ Authoritative
         │  Timer ticks                  │ state
         │                               │
         └───┬───────────────────────────┘
             │
             ▼
       ┌──────────────┐
       │  Prisma DB   │
       │  (SQLite/PG) │
       └──────────────┘
```

**Event Flow:**

1. Host clicks "Start Question"
2. Server processes: `question:start` event
3. Server broadcasts to all players: `{type: "question:start", ...question, time}`
4. Player receives, displays question + timer
5. Player submits answer at time T
6. Server validates, calculates score, broadcasts `question:scored`
7. Client updates local leaderboard

---

#### 3. Active Game State (Redis Cache)

Do NOT query DB for every round. Too slow.

```
Game Code "FUN42" → Redis Cache
  {
    gameId: "...",
    status: "ACTIVE",
    currentRound: 2,
    currentQuestion: "q_456",
    players: [
      {id: "p1", name: "Alice", score: 2450},
      {id: "p2", name: "Bob", score: 1890}
    ],
    startTime: 1708607400000,
    expiresAt: 1708610400000
  }
```

After game finishes, flush to Prisma DB for history/replays.

---

### Database Schema (Final Prisma Definition)

See Part 6 below for complete schema.

---

## 🎨 Part 5: UI/UX Patterns & Psychology

### The "Reveal Engine" (Where Your Game Shines)

Never instantly show correct answer. Instead:

**Phase 1: All Answers** (2 seconds)
```
Player 1: 240,000 miles
Player 2: 150,000 miles
Player 3: 500,000 miles
(All anonymous)
```

**Phase 2: Correct Answer** (3 seconds)
```
[Drum roll sound] 🥁
...
CORRECT: 238,900 miles
```

**Phase 3: Accuracy Reveal** (2 seconds)
```
Player 1: 89.6% accuracy ✅
Player 2: 41.1% accuracy ⚠️
Player 3: 0% accuracy ❌
```

**Phase 4: Leaderboard Shift** (2 seconds, animated)
```
1. Alice: +1,643 pts (now 4,093 total) 📈
2. Bob: +439 pts (now 2,329 total)
3. Charlie: +0 pts (still 1,890)
```

**Why:** Builds excitement, suspense, dopamine hits. Psychology of game shows.

---

### Voting Screen (For Taskmaster Tasks)

Show all submissions in a clean grid:

```
┌─────────┬─────────┬─────────┐
│ Task 1  │ Task 2  │ Task 3  │
│ [photo] │ [text]  │ [photo] │
│         │         │         │
│ [+ vote]│ [+ vote]│ [+ vote]│
└─────────┴─────────┴─────────┘
```

Each player picks top 2. Auto-calculates voting results. Simple, elegant.

---

### Leaderboard Animations

Scores should jump, not pop. Use Framer Motion or React Spring:

```
Old score: 1,890
New score: 2,450
Animation: Slide up + color pulse (green = gain, red = lose)
Duration: 1 second
```

This is the dopamine hit. Make it satisfying.

---

### Mobile Responsiveness

Game designed for tablets/phones + 1 host screen (TV/monitor).

- Sliders: Full-width touch targets
- Maps: Pinch-to-zoom mobile native
- Text: Large enough for quick reading
- Buttons: 48px+ for touch targets

---

## 📅 Part 6: Build Roadmap (30 Days to MVP)

### Phase 1: Foundation (Days 1–7)

**Goal:** Prove the core loop works with a real person.

**Day 1–2: Lobby System**
- Create new game (generates code)
- Join via code (WebSocket sync)
- Player list real-time update
- Host ready check

**Day 3–4: Database + Prisma**
- Schema setup (see Part 6)
- Migrations
- Test queries

**Day 5–7: Basic Game Flow**
- Host clicks "Start Game"
- Questions load from DB
- Timer displays (no WebSocket sync yet, just client)
- MCQ only (simplest type)

**Deliverable:** Can create game, join, answer 1 MCQ question with timer. No real-time sync yet.

---

### Phase 2: Core Mechanics (Days 8–14)

**Goal:** All question types work, scoring engine complete.

**Day 8–9: Range Ruler**
- Slider input
- Exponential scoring calculation
- Test scoring formula

**Day 10–11: WebSocket Sync**
- Server-authoritative clock
- Question broadcast
- Answer submission sync'd to server

**Day 12–13: Scoring Engine**
- Implement calculateScore() function
- Support all question types
- Animation reveal

**Day 14: Leaderboard**
- Update after each question
- Animated score changes
- Persist round scores

**Deliverable:** Can play a full 3-question game with real-time sync. Scores calculated correctly.

---

### Phase 3: Advanced Features (Days 15–21)

**Goal:** Game feels alive and social.

**Day 15–16: GeoGuessr**
- Leaflet map integration
- Click-to-pin
- Haversine distance calculation + scoring

**Day 17–18: String Input + Consensus**
- Text input validation
- Number proximity scoring
- Consensus mode (group average)

**Day 19–20: Taskmaster Lite**
- Photo upload (client-side only, store as base64 or local)
- Voting screen
- Vote calculation

**Day 21: Category Rounds**
- Implement "Precision", "Knowledge", "Chaos" round themes
- Shuffle questions by category

**Deliverable:** 5+ question types working. One full game feels complete.

---

### Phase 4: Polish & Performance (Days 22–28)

**Goal:** Game feels professional, smooth, fun.

**Day 22–23: Animations**
- Framer Motion for score updates
- Reveal animations (drum roll sfx)
- Smooth timer countdown

**Day 24–25: Sound & UX**
- Background music
- Correct/incorrect SFX
- Hover states, loading states

**Day 26: Mobile Responsive**
- Test on tablets
- Touch-friendly sliders
- Readable on small screens

**Day 27: Performance**
- WebSocket throttling
- Lazy load images
- Optimize re-renders

**Day 28: Bug Fixes**
- Playtest with 4+ friends
- Fix edge cases
- Improve error handling

---

### Phase 5: Launch & Iteration (Days 29–30+)

**Day 29–30: Deployment**
- Deploy frontend (Vercel)
- Deploy backend (Railway)
- Test with production DB

**Post-Launch:**
- Collect feedback
- Add Confidence Multiplier
- Buzzer Duel mode
- Hidden Reveal (unblur) mode

---

## ⚠️ Part 7: Critical Pitfalls to Avoid

### 1. **The "Too Many Features Too Soon" Trap**

❌ **Bad:** Build all 10 question types before MVP  
✅ **Good:** MCQ + Range Slider first, then expand

**Why:** You'll learn SO MUCH from playtesting 2 question types with real people. That feedback is worth 3x more than hypothetical.

---

### 2. **Socket.io Spam**

❌ **Bad:** Emit socket event on every slider pixel move  
✅ **Good:** Only emit on slider release OR throttle (once per 100ms)

**Why:** If 8 players move sliders simultaneously, server gets hammered. DDoS yourself accidentally.

---

### 3. **Physical Tasks = Time Killer**

❌ **Bad:** Add 10-minute video review round  
✅ **Good:** Photo + 30-second voting grid

**Why:** For MVP, speed matters. You learn faster with snappy rounds. Video can be v1.1.

---

### 4. **Client State as Source of Truth**

❌ **Bad:** Client says "Question time is up, lock it"  
✅ **Good:** Server says time is up, server locks it

**Why:** Players can cheat by manipulating client time. Always validate server-side.

---

### 5. **Leaderboard Ties Breaking Logic**

❌ **Bad:** Ignore ties, show random order  
✅ **Good:** Tie-breaking: (1) Total time taken, (2) Most perfect > questions

**Why:** Feels fair. Player psychology matters.

---

### 6. **One Mega Database Query**

❌ **Bad:** `SELECT * FROM games WHERE id = "FUN42"` → joins all tables  
✅ **Good:** Use Redis for active games, DB for history only

**Why:** Real-time sync needs speed. DB queries lag. Cache is fast.

---

### 7. **No Disconnect Handling**

❌ **Bad:** Player loses connection → game breaks  
✅ **Good:** Disconnect handling + rejoin grace period (10 seconds)

**Why:** Mobile networks are flaky. Players tap WiFi off accidentally. Forgiving is good UX.

---

## 🎯 Part 8: Design Philosophy — What's the Vibe?

Before you code, **define your game's personality:**

### Option A: "Chaotic Fun"
- Emphasis: Humor, social chaos, memes
- Scoring: Loose, forgiving, everyone scores
- Music: Upbeat, comedic
- Task types: More Taskmaster, less precise
- Best for: Friendship groups, parties

### Option B: "Competitive Intensity"
- Emphasis: Skill, rankings, winning
- Scoring: Harsh, exponential drop-off
- Music: Tense, dramatic
- Task types: More precision, validation
- Best for: Esports-like, leaderboards

### Option C: "Casual Brain Teaser"
- Emphasis: Learning, fun facts
- Scoring: Balanced, everyone learns
- Music: Calm, thinking
- Task types: Consensus, group average
- Best for: Classes, team building

**My Recommendation:** Start with **Option A (Chaotic Fun)**.

Why:
- Faster to build (fewer edge cases)
- More forgiving = better first impression
- People remember "that hilarious game"
- Easier to playtest (friends won't rage quit)

---

## 🧠 Part 9: Server-Authoritative Sync Deep Dive

This is the hardest part. Here's the exact flow:

### Scenario: Player submits answer

**T0 (Client sends):**
```javascript
socket.emit('answer:submit', {
  questionId: 'q_123',
  submittedValue: 250000,
  clientTime: Date.now()
})
```

**T1 (Server receives):**
```javascript
socket.on('answer:submit', (data) => {
  const serverTime = Date.now();
  const latency = serverTime - data.clientTime;
  
  const actualTimeToAnswer = 
    serverTime - question.startTime;
  
  // Validate: Did they submit before time ended?
  if (actualTimeToAnswer > question.duration) {
    return socket.emit('error', 'Too late!');
  }
  
  // Calculate score
  const score = calculateScore({
    type: question.type,
    submitted: data.submittedValue,
    correct: question.correct,
    timeMs: actualTimeToAnswer,
    maxTimeMs: question.duration
  });
  
  // Save to DB
  await prisma.answer.create({
    questionId: 'q_123',
    playerId: 'p_456',
    submitted: data.submittedValue,
    timeMs: actualTimeToAnswer,
    pointsEarned: score.points
  });
  
  // Update player score
  player.score += score.points;
  redis.set(`game:FUN42:player:p_456`, player);
  
  // Broadcast to all (answer locked for this player)
  io.to('game:FUN42').emit('answer:locked', {
    playerId: 'p_456'
  });
});
```

**T2 (Other clients receive):**
```javascript
socket.on('answer:locked', (data) => {
  markPlayerAsSubmitted(data.playerId);
  // Show "Waiting for others..." state
});
```

**T3 (Server checks all submitted OR timeout):**
```javascript
// After all submitted OR 30s elapsed:
setTimeout(() => {
  const answersForQuestion = await prisma.answer.findMany({
    where: { questionId: 'q_123' }
  });
  
  // Broadcast reveal
  io.to('game:FUN42').emit('question:reveal', {
    answers: answersForQuestion,
    correctAnswer: question.correct,
    scores: calculateAllScores(answersForQuestion)
  });
}, 30000);
```

**T4 (All clients animate reveal):**
- Show all answers
- Drum roll sound
- Reveal correct
- Show scores
- Update leaderboard

**This prevents cheating because:**
1. Server owns the clock
2. All timing validated server-side
3. Client can't fake submission time
4. Network lag doesn't give advantage

---

## 🗂️ Part 10: Final Database Schema

```prisma
model Game {
  id          String   @id @default(cuid())
  code        String   @unique // "FUN42"
  status      String   // LOBBY, ACTIVE, FINISHED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  players     Player[]
  rounds      Round[]
}

model Player {
  id        String @id @default(cuid())
  name      String
  gameId    String
  game      Game   @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  score     Int    @default(0)
  isHost    Boolean @default(false)
  isActive  Boolean @default(true)
  
  answers   Answer[]
  votes     Vote[]
  targetVotes Vote[] @relation("target") // Votes they received
  
  createdAt DateTime @default(now())
  
  @@unique([gameId, name]) // No duplicate names in game
}

model Round {
  id          String   @id @default(cuid())
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  roundNumber Int
  category    String   // "Precision", "Knowledge", "Chaos"
  status      String   // ACTIVE, COMPLETE
  
  questions   Question[]
  createdAt   DateTime @default(now())
}

model Question {
  id          String   @id @default(cuid())
  roundId     String
  round       Round    @relation(fields: [roundId], references: [id], onDelete: Cascade)
  
  type        String   // MULTIPLE_CHOICE, RANGE, GEO, TEXT_EXACT, TEXT_CLOSE, TASK, CONSENSUS, RANKING, HIDDEN_REVEAL, BUZZER
  text        String
  media       String?  // URL to image/sound
  correct     Json     // Structure depends on type
  metadata    Json     // min/max, tolerance, options, etc.
  pointsMax   Int      @default(1000)
  timeLimit   Int      @default(30) // seconds
  
  questionIndex Int    // Order in round (0, 1, 2, ...)
  
  answers     Answer[]
  createdAt   DateTime @default(now())
  
  @@unique([roundId, questionIndex])
}

model Answer {
  id          String   @id @default(cuid())
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  playerId    String
  player      Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  submitted   Json     // Player's answer (type depends on question type)
  timeMs      Int      // Time taken in milliseconds
  pointsEarned Int     @default(0)
  accuracy    Float    @default(0) // 0-1
  
  createdAt   DateTime @default(now())
  
  @@unique([questionId, playerId]) // One answer per player per question
}

model Vote {
  id        String @id @default(cuid())
  roundId   String
  
  voterId   String
  voter     Player @relation("voter", fields: [voterId], references: [id], onDelete: Cascade)
  
  targetId  String
  target    Player @relation("target", fields: [targetId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([roundId, voterId])
  @@index([roundId])
}
```

---

## ✅ Summary Checklist

Before you start coding:

- [ ] Understand the 10 question types
- [ ] Understand exponential decay scoring
- [ ] Understand server-authoritative clock
- [ ] Understand the 3 round categories
- [ ] Define your game's vibe (Chaotic / Competitive / Casual)
- [ ] Have Prisma schema memorized
- [ ] Know the game state machine
- [ ] Know the build roadmap (30 days)

**You're ready. Build fast. Test early. Iterate based on what's fun.**

Good luck. This is going to be awesome. 🚀
