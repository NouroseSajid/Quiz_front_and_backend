# Quiz Application Test Plan

## 1. Game Creation & Lobby System ✅

### Manual Tests (UI)
- [ ] Create new game from `/create` page
- [ ] Game code is displayed and can be copied
- [ ] Join game using code from `/join` page
- [ ] Multiple players can join same lobby
- [ ] Host is set correctly (first player to create)
- [ ] Player list updates in real-time
- [ ] Players can rejoin after disconnect
- [ ] Host can kick individual players
- [ ] Host can start game

### Automated Tests (API)
- [x] POST `/api/lobby/create` creates game with unique code
- [x] POST `/api/lobby/{gameId}/join` adds player to lobby
- [x] GET `/api/lobby/{gameId}` returns session with all players
- [x] POST `/api/lobby/{gameId}/start` moves to QUESTION_ACTIVE

---

## 2. Game Flow & Progression ✅

### Manual Tests (UI)
- [ ] First question appears after game starts
- [ ] Timer counts down from 30s (or question timeLimit)
- [ ] Timer auto-reveals when hitting 0
- [ ] Question text and type display correctly
- [ ] "Next Question" button progresses game
- [ ] Round ends and shows "Complete Round" button
- [ ] Next round loads with new category
- [ ] Game ends and redirects to `/game/{gameId}/results`

### Automated Tests (API)
- [x] POST `/api/game/{gameId}/next-question` advances question index
- [x] POST `/api/game/{gameId}/reveal` marks question as revealed
- [x] POST `/api/game/{gameId}/complete-round` completes current round
- [x] POST `/api/game/{gameId}/next-round` moves to next round
- [x] POST `/api/game/{gameId}/end` ends game with GAME_END checkpoint

---

## 3. Answer Submission & Validation ✅

### Question Type Tests (Manual - UI)

#### MULTIPLE_CHOICE
- [ ] Options are displayed
- [ ] Can select one option
- [ ] Submit button works
- [ ] Answer is recorded

#### RANGE
- [ ] Slider appears with min/max
- [ ] Can drag slider
- [ ] Value displays
- [ ] Submit works

#### GEO
- [ ] Map displays
- [ ] Can click to set location
- [ ] Coordinates show
- [ ] Submit works

#### TEXT_EXACT
- [ ] Text input appears
- [ ] Can type answer
- [ ] Submit works

#### TEXT_CLOSE
- [ ] Number input appears
- [ ] Can submit numeric answer
- [ ] Validation checks tolerance

#### RANKING
- [ ] Draggable items appear
- [ ] Can reorder items
- [ ] Submit works

#### TASK
- [ ] File upload appears
- [ ] Can upload file
- [ ] Submit works

#### CONSENSUS
- [ ] Opinion scale slider appears (e.g., 1-10)
- [ ] Can drag slider
- [ ] Submit works

#### HIDDEN_REVEAL
- [ ] Text input appears
- [ ] Can type answer
- [ ] Submit works

#### BUZZER
- [ ] Large red button displays
- [ ] Can click to buzz in
- [ ] Button state changes
- [ ] Submit works

### Automated Tests (API)
- [x] POST `/api/game/{gameId}/answer` accepts all question types
- [x] Answer validation rejects invalid data
- [x] Answers stored in question.answers

---

## 4. Results Display & Scoring ✅

### Manual Tests (UI)
- [ ] After reveal, correct answer displays
- [ ] Player results list shows
- [ ] Correct answers highlighted in green
- [ ] Wrong answers highlighted in red
- [ ] Points earned shows for each player
- [ ] Success rate percentage calculates
- [ ] Results sorted by points descending
- [ ] Host sees "Answer Visibility" panel
- [ ] Host can see all player submissions with timestamps
- [ ] Final leaderboard displays on results page

### Automated Tests (API)
- [x] GET `/api/lobby/{gameId}` returns revealed question with answers
- [x] Question.revealed flag set to true after reveal
- [x] Scoring calculations are correct

---

## 5. Host Controls ✅

### Manual Tests (UI)
- [ ] Host redirect: Player going to host page shows error or redirects
- [ ] Timer displays on host page
- [ ] Pause timer button ⏸️ works
- [ ] Resume timer button ▶️ works
- [ ] +30s button extends timer
- [ ] +60s button extends timer
- [ ] Question display matches player view
- [ ] Current question info shows in control panel
- [ ] Next Question button progresses
- [ ] Reveal/Score button appears
- [ ] Manual scoring inputs appear
- [ ] Score adjustments save
- [ ] Complete Round button works
- [ ] Next Round button works
- [ ] End Game button works
- [ ] Player leaderboard updates in real-time

### Automated Tests (API)
- [x] POST `/api/game/{gameId}/score` adjusts player scores
- [x] Host-only endpoints reject non-host players

---

## 6. Seeded Questions ✅

### Automated Tests (Database)
- [x] 5 TEXT_CLOSE questions exist
- [x] 3 CONSENSUS questions exist
- [x] 3 HIDDEN_REVEAL questions exist
- [x] 4 BUZZER questions exist
- [x] All questions have correct metadata
- [x] Questions are in proper rounds

### Manual Tests (UI)
- [ ] TEXT_CLOSE questions display and accept numeric input
- [ ] CONSENSUS questions display scale slider
- [ ] HIDDEN_REVEAL questions display with correct hint
- [ ] BUZZER questions display action button

---

## 7. Navigation & UI ✅

### Manual Tests (UI)
- [ ] Navigation dropdown appears on home page
- [ ] Dropdown contains all 5 menu items:
  - [ ] 🏠 Home
  - [ ] ➕ Create Game
  - [ ] 🎮 Join Game
  - [ ] ⚙️ Admin Panel
  - [ ] ❓ Add Questions
- [ ] Each menu item navigates correctly
- [ ] Dropdown closes after navigation
- [ ] Dropdown closes when clicking outside
- [ ] Home page responsive on mobile
- [ ] Game page responsive on mobile
- [ ] Results page responsive on mobile

---

## 8. Data Persistence ✅

### Automated Tests (API)
- [x] Game state persists across requests
- [x] Session backup saves to database
- [x] Session can be recovered from backup

### Manual Tests (UI)
- [ ] Page refresh maintains game state
- [ ] Browser back button doesn't break game
- [ ] Multiple players see same state

---

## 9. Error Handling

### Manual Tests (UI)
- [ ] Invalid game code shows error
- [ ] Empty player name shows error
- [ ] API errors display user-friendly messages
- [ ] Network disconnect shows retry option

### Automated Tests (API)
- [x] Invalid playerId returns 401
- [x] Invalid playerToken returns 401
- [x] Non-existent game returns 404
- [x] Invalid answer data returns 422

---

## 10. Performance & Edge Cases

### Manual Tests
- [ ] Game with 10+ players works smoothly
- [ ] Question with large text displays correctly
- [ ] File upload for TASK question works
- [ ] Long game (10+ rounds) completes
- [ ] Same player joins multiple games
- [ ] Player has unique token per game

### Automated Tests
- [x] Concurrent answer submissions handled
- [x] Rapid next-question calls handled
- [x] Timer doesn't go negative

---

## Summary

**Total Tests:** 100+
**Automated Tests:** 30+ ✅ (run below)
**Manual Tests:** 70+ (run manually with UI)
