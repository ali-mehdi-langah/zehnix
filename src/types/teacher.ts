export type ClassRow = {
  id: string;
  teacher_id: string;
  name: string;
  join_code: string;
  created_at: string;
};

export type EnrollmentRow = {
  id: string;
  class_id: string;
  student_id: string;
  created_at: string;
};

export type QuizRow = {
  id: string;
  class_id: string;
  title: string;
  topic: string;
  created_at: string;
};