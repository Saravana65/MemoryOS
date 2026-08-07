export interface User {
  id: string;
  email: string;
  full_name: string;
  plan?: string;
  is_active?: boolean;
  created_at?: string;
}
