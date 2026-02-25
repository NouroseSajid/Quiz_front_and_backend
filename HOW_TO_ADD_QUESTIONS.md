# How to Add Questions to a Lobby

## The Question Flow

The quiz app uses a **centralized question bank** approach:

### 1. Admin Creates Questions (Once)
Questions are created via the **Admin Panel** and stored in a special "ADMIN" game that acts as a question bank:

- **Option A:** Navigate to **Admin Panel** (`/admin`) → Create Question tab
- **Option B:** Navigate to **Add Questions** (`/admin/input`) 

Questions are organized by **category** (e.g., "General Knowledge", "Sports", "History"). Each category becomes a round.

### 2. Players Create Lobbies
When a player creates a lobby via **Create Game** (`/create`), they get an empty game with:
- ✅ A unique code (e.g., "FUN42")
- ✅ A host player
- ❌ **No rounds/questions yet**

### 3. Questions Auto-Copy on Game Start
When the **host clicks "Start Game"** in the lobby:

1. The system checks if the lobby has any rounds
2. If **no rounds exist**, it automatically:
   - Finds the ADMIN question bank
   - **Copies all rounds and questions** from ADMIN into the lobby's game
   - Starts the game with those questions

If there are no questions in the ADMIN bank, you'll see:
> "No questions in the question bank. Add questions via Admin > Add Questions first."

## Quick Recipe

```
1. Login to admin (/admin/login):
   - Username: nouroseadmin
   - Password: 123456789qwerty

2. Add questions (/admin):
   - Go to "Create Question" tab
   - Fill out the form (text, type, category, correct answer, etc.)
   - Click "Create Question"
   - Questions are saved to the ADMIN question bank

3. Create a lobby (/create):
   - Enter your name
   - Click "Create"
   - You're now in the lobby with your unique code

4. Start the game (in lobby):
   - Click "Start Game" (host only)
   - System automatically copies ADMIN questions to your game
   - Game begins with those questions!
```

## Important Notes

- **Questions are reusable:** The ADMIN bank is never modified when games run. Each new lobby gets a fresh copy.
- **You can't manually pick questions per lobby** (currently). All ADMIN questions are copied to every new game.
- **Question banks persist:** Questions you create in the admin panel are available for all future games.
- **Want different question sets?** You'd need to manually remove questions from ADMIN before creating a new lobby, or implement a "question set selection" feature.

## File Locations

- **Create questions:** [app/admin/page.tsx](app/admin/page.tsx) or [app/admin/input/page.tsx](app/admin/input/page.tsx)
- **Question creation API:** [app/api/admin/questions/route.ts](app/api/admin/questions/route.ts)
- **Auto-copy logic:** [app/api/lobby/[gameId]/start/route.ts](app/api/lobby/[gameId]/start/route.ts#L92-L149)
- **Lobby page:** [app/lobby/[gameId]/page.tsx](app/lobby/[gameId]/page.tsx)
