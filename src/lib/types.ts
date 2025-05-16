
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
    startDate: Date;
    endDate?: Date;
    isOpen: boolean;
  };
  skillsAddressed: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id?: string;
  workshopId: string;
  title: string;
  contentURI: string;
  requiresReflection: boolean;
  order: number;
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}
