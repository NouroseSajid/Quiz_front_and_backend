export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "RANGE"
  | "GEO"
  | "TEXT_EXACT"
  | "TEXT_CLOSE"
  | "TASK"
  | "CONSENSUS"
  | "RANKING"
  | "HIDDEN_REVEAL"
  | "BUZZER";

export type Difficulty = number; // 1-455, like Jeopardy point values

export type Category = "Precision" | "Knowledge" | "Chaos" | "Social";

export type GeoScope = "city" | "region" | "country" | "continent" | "world";

export interface QuestionInput {
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: Category;
  pointsMax: number;
  timeLimit: number;
  media?: string; // URL to image/sound
  correct: any; // Structure depends on type
  metadata: Record<string, any>;
}

export interface MCQOption {
  text: string;
  image?: string; // URL to image for future picture MCQ support
}

export interface MCQMetadata {
  options: (string | MCQOption)[]; // Support both simple strings and objects with images
  displayMode?: "text" | "image" | "mixed"; // How to display the options
}

export interface RangeMetadata {
  min: number;
  max: number;
  tolerance: number;
}

export interface GeoMetadata {
  lat: number;
  lng: number;
  scope: GeoScope;
  tolerance: number;
}

export interface TextMetadata {
  acceptedAnswers?: string[]; // For exact match
  tolerance?: number; // For number proximity
}

export interface TaskMetadata {
  taskType: "text" | "photo" | "physical";
  timeLimit: number;
  votingFormat: "top2"; // Can expand later
}

export interface RankingMetadata {
  items: string[];
  criterion: string;
}

export interface HiddenRevealMetadata {
  revealSteps: number;
  timePerStep: number;
}

export interface ConsensusMetadata {
  min: number;
  max: number;
  label: string;
}
