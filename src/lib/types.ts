
export type UserRole = "job_seeker" | "recruiter";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  planType: string;
  createdAt: Date;
}

export interface Workshop {
  id?: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName?: string;
  schedule: {
    startDate: Date | { seconds: number; nanoseconds: number };
    endDate?: Date | { seconds: number; nanoseconds: number };
    isOpen: boolean;
  };
  skillsAddressed: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt: Date | { seconds: number; nanoseconds: number };
}

export interface Lesson {
  id?: string;
  workshopId: string;
  title: string;
  contentURI: string;
  content?: string;  // Added for text-based lessons
  requiresReflection: boolean;
  order: number;
  estimatedDuration: number;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt: Date | { seconds: number; nanoseconds: number };
}

export interface Registration {
  id?: string;
  workshopId: string;
  learnerId: string;
  learnerName?: string;
  registeredAt: Date | { seconds: number; nanoseconds: number };
}

export interface Reflection {
  id?: string;
  lessonId: string;
  learnerId: string;
  learnerName?: string;
  content: string;
  submittedAt: Date | { seconds: number; nanoseconds: number };
  reviewed?: boolean;
}

export interface Progress {
  id?: string;
  lessonId: string;
  learnerId: string;
  reflectionId?: string;
  reflectionStatus: "approved" | "rejected" | "pending";
  points: number;
  reviewedBy: string;
  reviewedAt: Date | { seconds: number; nanoseconds: number };
}

export type ReflectionStatus = "approved" | "rejected" | "pending";
