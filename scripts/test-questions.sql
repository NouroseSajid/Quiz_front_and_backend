-- Test script to fetch questions from the database
-- Run this to verify questions are properly stored

-- Get all questions with their metadata
SELECT 
  q.id,
  q.text,
  q.type,
  q.timeLimit,
  q.pointsMax,
  q.metadata,
  q.correct,
  r.roundNumber,
  r.category,
  g.code,
  COUNT(*) OVER (PARTITION BY r.id) as questionCountInRound
FROM Question q
JOIN Round r ON q.roundId = r.id
JOIN Game g ON r.gameId = g.id
WHERE g.status = 'ACTIVE'
ORDER BY r.roundNumber, q.questionIndex;

-- Count questions by type
SELECT 
  type,
  COUNT(*) as count,
  AVG(timeLimit) as avgTimeLimit,
  AVG(pointsMax) as avgPoints
FROM Question
GROUP BY type
ORDER BY count DESC;

-- Get all rounds with question counts
SELECT 
  r.id,
  r.roundNumber,
  r.category,
  g.code,
  COUNT(q.id) as questionCount
FROM Round r
LEFT JOIN Question q ON r.id = q.roundId
LEFT JOIN Game g ON r.gameId = g.id
GROUP BY r.id, r.roundNumber, r.category, g.code
ORDER BY g.code, r.roundNumber;
