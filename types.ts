
export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum CourseFormat {
  MIXED = 'Mixed',
  TEXT_ONLY = 'Text Only',
  AUDIO_ONLY = 'Audio Only',
  PODCAST_STYLE = 'Podcast Style'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  summary: string;
  imagePrompt: string;
  audioScript: string;
  podcastScript?: string;
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  learningObjectives: string[];
  estimatedDuration: string;
  modules: Module[];
  completedLessonIds?: string[]; // Track lesson completion for persistence
}

export interface AgentState {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  description: string;
}
