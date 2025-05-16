
export type UserRole = "job_seeker" | "recruiter";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  planType: string;
  createdAt: Date;
}
