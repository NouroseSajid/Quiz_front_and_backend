# 🎮 Admin Panel - Question Input Guide

## Overview

The Admin Panel is where you create and manage quiz questions for "The Vibe Check" game. Located at `/app/admin/input`, it provides a comprehensive interface for adding questions of all 10 types.

## Folder Structure

```
/app/admin/input/
├── page.tsx                    # Main admin page with tabs
├── components/
│   ├── QuestionForm.tsx        # Form for creating questions
│   └── QuestionsList.tsx       # Display all created questions
```

## Features

### 1. **Create Question Tab**

The question form supports all 10 question types:

- **Multiple Choice (MCQ)** - 4 options, select correct one
- **Range Slider** - Estimation questions with min/max values
- **GeoGuessr** - Click on map to pinpoint locations
- **Text Exact** - Type exact answers (comma-separated options)
- **Text Close** - Number proximity (counts error tolerance)
- **Taskmaster** - Real-world challenges (photos/text submissions)
- **Consensus** - Group vibe mode (% answers)
- **Ranking** - Order items correctly
- **Hidden Reveal** - Unblur image to guess (progressive reveal)
- **Buzzer** - Fast first-to-answer mode

### 2. **Question Metadata**

Every question has:
- **Text**: The question prompt
- **Type**: What kind of question it is
- **Difficulty**: 1-455 (numeric level, like Jeopardy point values)
- **Category**: Precision, Knowledge, Chaos, or Social
- **Time Limit**: 5-120 seconds
- **Max Points**: Base points (before multipliers)

### 3. **Manage Questions Tab**

View all created questions organized by:
- Category (Precision, Knowledge, Chaos, Social)
- Type (MCQ, Range, etc.)
- Edit/Delete buttons (not yet implemented)

## How to Use

### Step 1: Fill Out Question Details

```
Question Text: "How far is the Moon from Earth?"
Type: Range Slider
Difficulty: 100
Category: Precision
Time Limit: 30 seconds
Max Points: 1000
```

### Step 2: Configure Type-Specific Details

**For MCQ:**
- Enter 4 option texts
- Click "Set Correct" on the right answer

**For Range:**
- Set Min value (e.g., 0)
- Set Max value (e.g., 500,000)
- Enter correct answer (e.g., 238,900)

**For GeoGuessr:**
- Enter Latitude (e.g., 41.8902)
- Enter Longitude (e.g., 12.4922)

**For Text Exact:**
- Enter comma-separated accepted answers
- Example: `Zambia, Zimbabwe, Zaire`

**For Text Close:**
- Enter correct number
- Example: `54`

### Step 3: Submit

Click "Create Question" to save to the database.

## Database Storage

All questions are stored in a default "ADMIN" game with rounds organized by category:

```
ADMIN Game
├── Precision Round → All Range, Geo, and Consensus questions
├── Knowledge Round → All MCQ and Text questions
├── Chaos Round → All Task and Buzzer questions
└── Social Round → All group/voting questions
```

When you create a game later, you'll randomly select questions from these stored questions.

## API Endpoints

- **POST** `/api/admin/questions` - Create a new question
- **GET** `/api/admin/questions` - Fetch all admin questions

## Future Enhancements

- Edit existing questions
- Delete questions
- Duplicate questions
- Bulk import (CSV)
- Question preview before creation
- Sort/filter questions
- Tag/label system

## Testing the Form

Try creating these test questions:

**Test 1: MCQ**
```
Q: "Which planet is closest to the sun?"
Options: Mercury, Venus, Earth, Mars
Correct: Mercury
```

**Test 2: Range**
```
Q: "How many countries in the world?"
Min: 150, Max: 250
Correct: 195
```

**Test 3: GeoGuessr**
```
Q: "Latitude and longitude of Big Ben"
Lat: 51.4975, Lng: -0.1245
```

All questions are categorized automatically based on their type.
