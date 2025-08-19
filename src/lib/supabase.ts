import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client (only if configured)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface Note {
  id: number;
  title: string;
  created_at?: string;
}

// Notes API functions
export const notesApi = {
  // Get all notes
  async getNotes(): Promise<Note[]> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return data || [];
  },

  // Add a new note
  async addNote(title: string): Promise<Note> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
    }

    if (!title.trim()) {
      throw new Error('Note title cannot be empty');
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{ title: title.trim() }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }

    return data;
  },

  // Delete a note
  async deleteNote(id: number): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  },

  // Update a note
  async updateNote(id: number, title: string): Promise<Note> {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
    }

    if (!title.trim()) {
      throw new Error('Note title cannot be empty');
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ title: title.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update note: ${error.message}`);
    }

    return data;
  }
};