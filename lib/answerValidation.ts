/**
 * Answer Validation Module
 * 
 * Validates player answers against question metadata to ensure:
 * - Type correctness (number vs string vs array)
 * - Value constraints (min/max, array length, etc)
 * - Required fields are present
 * 
 * This prevents bad data from entering the database and causing scoring issues
 */

import type { QuestionType } from "./types";

export interface ValidationError {
  valid: false;
  error: string;
  code: string;
}

export interface ValidationSuccess {
  valid: true;
  normalizedAnswer: any;
}

export type ValidationResult = ValidationSuccess | ValidationError;

/**
 * Main validation function - routes to type-specific validators
 */
export function validateAnswer(
  answer: any,
  questionType: QuestionType,
  metadata: Record<string, any>
): ValidationResult {
  switch (questionType) {
    case "MULTIPLE_CHOICE":
      return validateMCQ(answer, metadata);
    case "RANGE":
      return validateRange(answer, metadata);
    case "GEO":
      return validateGeo(answer, metadata);
    case "TEXT_EXACT":
    case "TEXT_CLOSE":
      return validateText(answer, metadata);
    case "RANKING":
      return validateRanking(answer, metadata);
    case "TASK":
      return validateTask(answer, metadata);
    case "CONSENSUS":
      return validateConsensus(answer, metadata);
    case "HIDDEN_REVEAL":
    case "BUZZER":
      // These types don't need validation
      return { valid: true, normalizedAnswer: answer };
    default:
      return {
        valid: false,
        error: `Unknown question type: ${questionType}`,
        code: "UNKNOWN_TYPE",
      };
  }
}

/**
 * Multiple Choice: Answer must be 0-3 (index of selected option)
 */
function validateMCQ(
  answer: any,
  metadata: Record<string, any>
): ValidationResult {
  if (answer === null || answer === undefined) {
    return {
      valid: false,
      error: "No answer provided for multiple choice",
      code: "MISSING_ANSWER",
    };
  }

  const answerNum = Number(answer);
  if (!Number.isInteger(answerNum)) {
    return {
      valid: false,
      error: "MCQ answer must be an integer",
      code: "INVALID_MCQ_FORMAT",
    };
  }

  const options = metadata?.options || [];
  if (answerNum < 0 || answerNum >= options.length) {
    return {
      valid: false,
      error: `MCQ answer must be between 0 and ${options.length - 1}`,
      code: "MCQ_OUT_OF_RANGE",
    };
  }

  return { valid: true, normalizedAnswer: answerNum };
}

/**
 * Range: Answer must be a number within [min, max]
 */
function validateRange(
  answer: any,
  metadata: Record<string, any>
): ValidationResult {
  if (answer === null || answer === undefined || answer === "") {
    return {
      valid: false,
      error: "No answer provided for range question",
      code: "MISSING_ANSWER",
    };
  }

  const answerNum = Number(answer);
  if (isNaN(answerNum)) {
    return {
      valid: false,
      error: "Range answer must be a valid number",
      code: "INVALID_RANGE_FORMAT",
    };
  }

  const { min, max } = metadata || {};
  if (min !== undefined && answerNum < min) {
    return {
      valid: false,
      error: `Range answer must be at least ${min}`,
      code: "RANGE_TOO_LOW",
    };
  }

  if (max !== undefined && answerNum > max) {
    return {
      valid: false,
      error: `Range answer must be at most ${max}`,
      code: "RANGE_TOO_HIGH",
    };
  }

  return { valid: true, normalizedAnswer: answerNum };
}

/**
 * Geo: Answer must be {lat: number, lng: number}
 */
function validateGeo(
  answer: any,
  metadata: Record<string, any>
): ValidationResult {
  if (!answer || typeof answer !== "object") {
    return {
      valid: false,
      error: "Geo answer must be an object with lat/lng",
      code: "INVALID_GEO_FORMAT",
    };
  }

  const { lat, lng } = answer;

  if (lat === null || lat === undefined || lat === "") {
    return {
      valid: false,
      error: "Latitude is required",
      code: "MISSING_LATITUDE",
    };
  }

  if (lng === null || lng === undefined || lng === "") {
    return {
      valid: false,
      error: "Longitude is required",
      code: "MISSING_LONGITUDE",
    };
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return {
      valid: false,
      error: "Latitude and longitude must be valid numbers",
      code: "INVALID_GEO_NUMBERS",
    };
  }

  if (latNum < -90 || latNum > 90) {
    return {
      valid: false,
      error: "Latitude must be between -90 and 90",
      code: "INVALID_LATITUDE_RANGE",
    };
  }

  if (lngNum < -180 || lngNum > 180) {
    return {
      valid: false,
      error: "Longitude must be between -180 and 180",
      code: "INVALID_LONGITUDE_RANGE",
    };
  }

  return {
    valid: true,
    normalizedAnswer: { lat: latNum, lng: lngNum },
  };
}

/**
 * Text: Answer must be non-empty string
 */
function validateText(
  answer: any,
  metadata: Record<string, any>
): ValidationResult {
  if (answer === null || answer === undefined) {
    return {
      valid: false,
      error: "No answer provided for text question",
      code: "MISSING_ANSWER",
    };
  }

  const answerStr = String(answer).trim();
  if (answerStr.length === 0) {
    return {
      valid: false,
      error: "Text answer cannot be empty",
      code: "EMPTY_TEXT",
    };
  }

  if (answerStr.length > 10000) {
    return {
      valid: false,
      error: "Text answer is too long (max 10000 characters)",
      code: "TEXT_TOO_LONG",
    };
  }

  return { valid: true, normalizedAnswer: answerStr };
}

/**
 * Ranking: Answer must be array matching items in metadata
 */
function validateRanking(
  answer: any,
  metadata: Record<string, any>
): ValidationResult {
  if (!Array.isArray(answer)) {
    return {
      valid: false,
      error: "Ranking answer must be an array",
      code: "INVALID_RANKING_FORMAT",
    };
  }

  const items = metadata?.items || [];
  if (answer.length !== items.length) {
    return {
      valid: false,
      error: `Ranking must include all ${items.length} items`,
      code: "RANKING_LENGTH_MISMATCH",
    };
  }

  // Check that all answer items exist in metadata items
  const itemSet = new Set(items);
  for (const item of answer) {
    if (!itemSet.has(item)) {
      return {
        valid: false,
        error: `Invalid ranking item: ${item}`,
        code: "INVALID_RANKING_ITEM",
      };
    }
  }

  // Check for duplicates
  const uniqueSet = new Set(answer);
  if (uniqueSet.size !== answer.length) {
    return {
      valid: false,
      error: "Ranking items must be unique",
      code: "DUPLICATE_RANKING_ITEMS",
    };
  }

  return { valid: true, normalizedAnswer: answer };
}

/**
 * Task: Different handling for photo/text/physical
 */
function validateTask(
  answer: any,
  metadata: Record<string, any>
): ValidationResult {
  const { taskType } = metadata || {};

  if (taskType === "photo") {
    // File will be uploaded separately - just verify shape
    if (answer && typeof answer === "object" && "name" in answer) {
      return { valid: true, normalizedAnswer: answer };
    }
    return {
      valid: false,
      error: "Photo task requires a file upload",
      code: "MISSING_PHOTO",
    };
  }

  if (taskType === "text") {
    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return {
        valid: false,
        error: "Text task requires a response",
        code: "MISSING_TASK_TEXT",
      };
    }
    return { valid: true, normalizedAnswer: answer.trim() };
  }

  if (taskType === "physical") {
    if (!answer || typeof answer !== "object") {
      return {
        valid: false,
        error: "Physical task requires completion confirmation",
        code: "MISSING_PHYSICAL_CONFIRMATION",
      };
    }
    const { completed, proof } = answer;
    if (!completed || !proof) {
      return {
        valid: false,
        error: "Physical task requires both completion and proof confirmation",
        code: "INCOMPLETE_PHYSICAL_TASK",
      };
    }
    return { valid: true, normalizedAnswer: answer };
  }

  return {
    valid: false,
    error: `Unknown task type: ${taskType}`,
    code: "UNKNOWN_TASK_TYPE",
  };
}

/**
 * Consensus: Answer must be a number within range
 */
function validateConsensus(
  answer: any,
  metadata: Record<string, any>
): ValidationResult {
  if (answer === null || answer === undefined || answer === "") {
    return {
      valid: false,
      error: "No answer provided for consensus question",
      code: "MISSING_ANSWER",
    };
  }

  const answerNum = Number(answer);
  if (isNaN(answerNum)) {
    return {
      valid: false,
      error: "Consensus answer must be a valid number",
      code: "INVALID_CONSENSUS_FORMAT",
    };
  }

  const { min, max } = metadata || {};
  if (min !== undefined && answerNum < min) {
    return {
      valid: false,
      error: `Consensus answer must be at least ${min}`,
      code: "CONSENSUS_TOO_LOW",
    };
  }

  if (max !== undefined && answerNum > max) {
    return {
      valid: false,
      error: `Consensus answer must be at most ${max}`,
      code: "CONSENSUS_TOO_HIGH",
    };
  }

  return { valid: true, normalizedAnswer: answerNum };
}
