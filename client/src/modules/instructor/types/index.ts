export interface InstructorProfile {
  id: string;
  first_name: string;
  last_name: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  rating?: number;
}

export interface CourseSummary {
  id: string;
  title: string;
  students: number;
  rating: number;
  price: number;
  published: boolean;
}

export interface InstructorStats {
  activeCourses: number;
  totalStudents: number;
  monthlyRevenue: number;
  averageRating: number;
}


