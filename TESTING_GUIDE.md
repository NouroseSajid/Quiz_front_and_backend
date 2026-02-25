# Testing Instructions

## Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Server will run on `http://localhost:3000`

---

## Automated API Testing

### Prerequisites
- Development server running on `http://localhost:3000`
- Node.js 18+ installed

### Run API Tests
```bash
npx tsx scripts/test-api.ts
```

**What does it test:**
✅ Game creation and player joining
✅ Lobby session management
✅ Game start and question loading
✅ Answer submission for all types
✅ Question reveal
✅ Scoring and player progression
✅ Round completion and next round
✅ Game end
✅ Error handling
✅ Data persistence

**Expected Output:**
```
📊 TEST RESULTS

✅ Passed: 25+
❌ Failed: 0
📈 Total:  25+

🎉 All tests passed!
```

---

## Manual Testing - UI/UX

### Test Group 1: Game Creation & Joining (5 min)

**Setup:** Open `http://localhost:3000` in two browser windows

1. **Window 1 (Host):**
   - Click "☰ Navigation" → "➕ Create Game"
   - Note the game code displayed
   - Click "+ Add Question" to load test questions

2. **Window 2 (Player):**
   - Click "☰ Navigation" → "🎮 Join Game"
   - Enter the game code from Window 1
   - Click "Join"

3. **Verify:**
   - ✅ Both windows show same lobby
   - ✅ Player list shows 2 players
   - ✅ Host button appears for Window 1

---

### Test Group 2: Question & Answer Flow (10 min)

**Prerequisites:** Game created with 2+ players in Lobby

1. **Window 1 (Host):**
   - Click "Start Game"
   - Verify you're redirected to host panel
   - See question text and timer

2. **Window 2 (Player):**
   - See question and answer input
   - Timer counts down
   - Enter an answer based on question type:
     - **MULTIPLE_CHOICE**: Click an option
     - **RANGE**: Drag slider
     - **GEO**: Click map location
     - **TEXT_EXACT**: Type exact answer
     - **TEXT_CLOSE**: Enter number with tolerance
     - **RANKING**: Drag items to reorder
     - **TASK**: Upload a file
     - **CONSENSUS**: Drag opinion scale
     - **HIDDEN_REVEAL**: Type mystery answer
     - **BUZZER**: Click red button

3. **Verify:**
   - ✅ Answer input matches question type
   - ✅ Submit button enables
   - ✅ Answer accepted without error

---

### Test Group 3: Timer & Auto-Reveal (5 min)

**Prerequisites:** Question active in game

1. **Window 1 (Host Panel):**
   - See timer at top of control panel
   - Timer shows seconds remaining
   - Click "⏸️ Pause Timer" - should stop
   - Click "▶️ Resume Timer" - should continue
   - Click "⏱️ +30 Seconds" - timer increases
   - Click "⏱️ +60 Seconds" - timer increases more

2. **Watch as timer reaches 0:**
   - ✅ Auto-triggers reveal
   - ✅ Checkpoint changes to QUESTION_RESULTS
   - ✅ Results display shows automatically

---

### Test Group 4: Results Display (5 min)

**Prerequisites:** Question has been revealed

1. **Window 2 (Player Results):**
   - ✅ See "Correct Answer" in green box
   - ✅ See player results table
   - ✅ Your answer highlighted (green if correct, red if wrong)
   - ✅ Points earned displayed
   - ✅ Success rate percentage shown (e.g., "75% Success Rate")
   - ✅ Results sorted by points earned

2. **Window 1 (Host Panel):**
   - ✅ See "Player Answers" section
   - ✅ Can expand each player answer
   - ✅ See submission times
   - ✅ Manual scoring inputs visible

---

### Test Group 5: Progression (5 min)

**Prerequisites:** Results displayed

1. **Window 1 (Host Panel):**
   - Click "➡️ Next Question"
   - Verify question index increments
   - New question displays

2. **After all questions in round:**
   - Click "⏁ Complete Round"
   - Checkpoint changes to ROUND_RESULTS
   - Click "📊 Next Round"
   - New round loads

3. **After all rounds:**
   - Click "⏹️ End Game"
   - Game ends

---

### Test Group 6: Final Results Page (5 min)

**Prerequisites:** Game has ended

1. **Window 2 (Player):**
   - ✅ Auto-redirected to `/game/{gameId}/results`
   - ✅ See final leaderboard with medals 🥇🥈🥉
   - ✅ Your rank and score displayed
   - ✅ Player stats card shows:
     - Your rank
     - Your score
     - Gap to 1st place
   - ✅ Statistics grid shows:
     - Total players
     - Top score
     - Average score
   - ✅ "🏠 Home" and "🎮 Play Again" buttons present
   - ✅ Celebratory message based on rank

---

### Test Group 7: Question Type Specific Tests (15 min)

#### MULTIPLE_CHOICE
- [ ] Options display as buttons
- [ ] Only one can be selected at a time
- [ ] Selected option highlighted
- [ ] Correct answer shown in green after reveal

#### RANGE
- [ ] Slider appears with min/max labels
- [ ] Current value displays
- [ ] Can drag to adjust
- [ ] Shows tolerance range if applicable

#### GEO
- [ ] Map loads
- [ ] Can click to set location
- [ ] Coordinates display
- [ ] Red pin shows selected location

#### TEXT_EXACT
- [ ] Text input field appears
- [ ] Placeholder text helpful
- [ ] Case-sensitive if applicable
- [ ] Fuzzy matching works in results

#### TEXT_CLOSE
- [ ] Number input appears
- [ ] Can enter any number
- [ ] Shows tolerance in results (e.g., "±5")
- [ ] Correct if within tolerance

#### RANKING
- [ ] All items display
- [ ] Can click and drag items
- [ ] Drop targets highlight
- [ ] Final order matches submission

#### TASK
- [ ] File input appears
- [ ] Can select file
- [ ] File shows in submission
- [ ] Host can review in task panel

#### CONSENSUS
- [ ] Horizontal slider (1-10, 0-100, etc.)
- [ ] Shows min/max labels
- [ ] Current value updates
- [ ] Results show other players' answers

#### HIDDEN_REVEAL
- [ ] Text input with hint
- [ ] Hint shows partial answer
- [ ] Answer hides until reveal
- [ ] Shows as "Mystery Answer" until revealed

#### BUZZER
- [ ] Large red button displays
- [ ] Button text: "BUZZ IN!"
- [ ] Changes color/state when clicked
- [ ] Only one player can buzz first

---

### Test Group 8: Navigation (3 min)

**Setup:** Open `http://localhost:3000` in browser

1. **Navigation Dropdown:**
   - ✅ "☰ Navigation" button visible top-right
   - ✅ Click to open dropdown menu
   - ✅ Menu contains:
     - 🏠 Home
     - ➕ Create Game
     - 🎮 Join Game
     - ⚙️ Admin Panel
     - ❓ Add Questions

2. **Menu Navigation:**
   - Click "🏠 Home" → redirects to `/`
   - Click "➕ Create Game" → redirects to `/create`
   - Click "🎮 Join Game" → redirects to `/join`
   - Click "⚙️ Admin Panel" → redirects to `/admin`
   - Click "❓ Add Questions" → redirects to `/admin/input`
   - ✅ Menu closes after navigation

---

### Test Group 9: Admin Panel (5 min)

**Setup:** Navigate to `http://localhost:3000/admin`

1. **Admin Page:**
   - ✅ Can view existing questions
   - ✅ Question list displays all types
   - Navigate to `/admin/input`

2. **Add Questions Page:**
   - ✅ Can select question type
   - ✅ Type-specific inputs appear
   - Try adding a question:
     - Select type
     - Fill metadata
     - Click "Add Question"
     - ✅ Question added to database

---

### Test Group 10: Error Handling (5 min)

1. **Invalid Game Code:**
   - Go to `/join`
   - Enter code "INVALID123"
   - ✅ Error message: "Game not found"

2. **Missing Player Name:**
   - Go to home page
   - Click join without entering name
   - ✅ Error message: "Player name required"

3. **Token Validation:**
   - Join a game
   - Open browser DevTools → Storage → localStorage
   - Change token value to invalid
   - Try to answer question
   - ✅ Error message: "Invalid player token"

4. **Network Error:**
   - Close development server while in game
   - Try to move to next question
   - ✅ Error message displays:
     - "Network error" or
     - "Failed to connect"

---

### Test Group 11: Responsive Design (5 min)

**Desktop (1920x1080):**
- [ ] All elements fit without overflow
- [ ] Game page uses full width
- [ ] Results page grid displays 2 columns

**Tablet (768x1024):**
- [ ] Navigation still accessible
- [ ] Game page stack vertically
- [ ] Results page grid displays 1 column

**Mobile (375x667):**
- [ ] Touch-friendly buttons
- [ ] No horizontal scroll
- [ ] Leaderboard scrolls vertically
- [ ] Timer visible at top

---

### Test Group 12: Concurrent Players (10 min)

**Setup:** 3+ browser windows with different players in same game

1. **Player 1 (Host):**
   - Start game
   - Go to host panel

2. **Players 2-3:**
   - Each in separate window
   - Submit different answers
   - Watch for simultaneous updates

3. **Verify:**
   - ✅ All submissions received
   - ✅ Results show all players
   - ✅ Leaderboard updates in real-time
   - ✅ No conflicts or data corruption

---

## Known Issues / Edge Cases

- [ ] Session recovery after browser crash
- [ ] File upload limits (check max size)
- [ ] Very long game names truncation
- [ ] Network latency handling (3G vs 5G)
- [ ] Rapid clicks on buttons (debounce test)
- [ ] Memory usage with many players
- [ ] Large number input handling

---

## Checklist Summary

### Critical Tests (Must Pass)
- [ ] Game create and join works
- [ ] Questions load and display
- [ ] Answers submit successfully
- [ ] Timer counts down and auto-reveals
- [ ] Results display correctly
- [ ] Game progression works
- [ ] Final results page loads
- [ ] No console errors

### Important Tests (Should Pass)
- [ ] All 10 question types work
- [ ] Navigation dropdown works
- [ ] Host controls function
- [ ] Scoring calculations correct
- [ ] Player list updates real-time
- [ ] Error messages helpful

### Nice-to-Have Tests (Can Pass Later)
- [ ] Admin panel adds questions
- [ ] File upload for TASK questions
- [ ] Mobile responsiveness perfect
- [ ] Concurrent player testing
- [ ] Network resilience

---

## Report Results

After testing, document:
1. ✅ What passed
2. ❌ What failed
3. 🐛 Any bugs found
4. 💬 Feedback/improvements

Example:
```
✅ PASSED:
- Game creation and joining
- Question display
- Answer submission
- Results calculation
- Navigation menu

❌ FAILED:
- [None found]

🐛 BUGS:
- Consensus slider stops at 11 instead of 10

💬 SUGGESTIONS:
- Add help text for GEO question
- Consider adding sound effects
```
