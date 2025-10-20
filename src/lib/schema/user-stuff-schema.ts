// lib/interfaces/stuff.ts

export interface IUserStuff {  
  // Timestamps
  created_at: string; // ISO date string

  // Storage URLs
  small_url: string;
  medium_url: string;
  original_url: string;

  // Metadata
  name: string | null;
  description: string | null;
  content: Record<string, string> | null; // JSONB
  mime_type: string | null;
  public_id: string | null;
  user_note: string | null;
  tags: string[] | null; // Assuming tags are stored as a JSON array of strings

  // Ownership
  clerk_user_id: string; 
  source: 'uploaded' | 'generated' | 'created' | 'bookmarked';
  type: 'thumbnail' | 'cover' | 'icon' | 'intext';
  category: string | null;

  // Deletion
  is_deleted: boolean;
  deleted_at: string | null; // ISO date string (timestamp with timezone)  
}
