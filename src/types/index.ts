export interface Tree {
  id: string;
  user_id: string;
  name: string;
  species?: string;
  latitude: number;
  longitude: number;
  image_url: string;
  description?: string;
  planted_date: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}