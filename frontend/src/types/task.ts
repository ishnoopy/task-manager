export type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
};
