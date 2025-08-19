# Notes Feature - Setup and Usage Guide

## Overview

The Notes feature in SPECTRA provides a complete note management system using Supabase as the backend database. This feature implements the exact SQL schema specified in the problem statement and provides a full CRUD (Create, Read, Update, Delete) interface.

## Database Schema

The Notes feature uses the following Supabase table structure:

```sql
-- Create the table
create table notes (
  id bigint primary key generated always as identity,
  title text not null
);

-- Insert some sample data into the table
insert into notes (title)
values
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

alter table notes enable row level security;
```

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Click "New Project" to create a new Supabase project
3. Fill in your project details and wait for the project to be created

### 2. Create the Notes Table

1. In your Supabase dashboard, go to the "SQL Editor"
2. Run the following SQL to create the notes table:

```sql
create table notes (
  id bigint primary key generated always as identity,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notes enable row level security;

-- Optional: Add Row Level Security policies
-- Allow all operations for authenticated users (adjust as needed)
create policy "Enable all operations for authenticated users" on "public"."notes"
as permissive for all
to authenticated
using (true);

-- For public access (not recommended for production):
create policy "Enable read access for all users" on "public"."notes"
as permissive for select
to public
using (true);

create policy "Enable insert access for all users" on "public"."notes"
as permissive for insert
to public
with check (true);

create policy "Enable update access for all users" on "public"."notes"
as permissive for update
to public
using (true);

create policy "Enable delete access for all users" on "public"."notes"
as permissive for delete
to public
using (true);
```

### 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy your:
   - **Project URL** (looks like `https://your-project.supabase.co`)
   - **Anon key** (the public anonymous key)

### 4. Configure Environment Variables

1. In your SPECTRA project, create or update your `.env` file:

```env
# Supabase Configuration (for Notes feature)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Restart your development server:

```bash
npm run dev
```

## Features

### ✅ Complete CRUD Operations
- **Create**: Add new notes with title validation
- **Read**: Display all notes in a table format
- **Update**: Edit notes inline with save/cancel options
- **Delete**: Remove notes with confirmation dialog

### ✅ User Experience
- **Loading States**: Shows loading indicators during operations
- **Error Handling**: Graceful error messages with retry options
- **Toast Notifications**: Success and error feedback
- **Responsive Design**: Works on all screen sizes
- **Form Validation**: Prevents empty notes

### ✅ Demo Data
- **Quick Setup**: Add sample notes from the problem statement with one click
- **Empty State**: Helpful message when no notes exist

## Usage

### Adding Notes

1. Navigate to the "Notes" tab in SPECTRA
2. Enter your note title in the "Add New Note" form
3. Click "Add Note" to save

### Editing Notes

1. Click the edit icon (pencil) next to any note
2. Modify the title in the inline editor
3. Press Enter or click the save icon to confirm
4. Press Escape or click the cancel icon to discard changes

### Deleting Notes

1. Click the delete icon (trash) next to any note
2. Confirm the deletion in the dialog that appears

### Demo Data

If you want to quickly test the feature with the sample data from the problem statement:

1. Navigate to the Notes tab
2. Click "Add Demo Notes" at the bottom
3. Three sample notes will be added:
   - "Today I created a Supabase project."
   - "I added some data and queried it from Next.js."
   - "It was awesome!"

## API Reference

The Notes feature is built on top of the Supabase client with the following API functions:

```typescript
// Get all notes (ordered by creation date, newest first)
const notes = await notesApi.getNotes();

// Add a new note
const newNote = await notesApi.addNote("My note title");

// Update an existing note
const updatedNote = await notesApi.updateNote(1, "Updated title");

// Delete a note
await notesApi.deleteNote(1);
```

## Troubleshooting

### "Database Setup Required" Message

If you see this message, it means the Supabase environment variables are not configured:

1. Check that your `.env` file contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Ensure the values are correct (no quotes needed)
3. Restart your development server

### "Failed to fetch" Errors

This usually indicates:

1. **Incorrect URL**: Check your `VITE_SUPABASE_URL` is correct
2. **Wrong API Key**: Verify your `VITE_SUPABASE_ANON_KEY` is the anon/public key
3. **RLS Policies**: Ensure your Row Level Security policies allow the operations
4. **Network Issues**: Check your internet connection

### Table Not Found

If you get "table 'notes' does not exist" errors:

1. Ensure you've run the SQL schema in your Supabase SQL Editor
2. Check the table was created in the "public" schema
3. Verify the table name is exactly "notes" (lowercase)

## Security Considerations

### Row Level Security (RLS)

The notes table has RLS enabled by default. For development, you can use the permissive policies shown above. For production, consider more restrictive policies:

```sql
-- Example: Only allow users to manage their own notes
create policy "Users can only manage their own notes" on "public"."notes"
as permissive for all
to authenticated
using (auth.uid() = user_id);
```

### API Keys

- Never commit real API keys to your repository
- Use environment variables for all sensitive configuration
- The anon key is safe to use in client-side code as it respects RLS policies

## Integration with SPECTRA

The Notes feature is seamlessly integrated into the SPECTRA interface:

- **Tab Navigation**: Accessible via the "Notes" tab in the main interface
- **Consistent Styling**: Uses the same UI components as the rest of SPECTRA
- **Responsive Design**: Adapts to all screen sizes
- **Error Boundaries**: Graceful error handling that doesn't break the main application

## Future Enhancements

Possible future improvements:

1. **Rich Text Editor**: Support for formatted notes
2. **Categories/Tags**: Organize notes with labels
3. **Search**: Find notes by content
4. **Real-time Updates**: Live sync across multiple sessions
5. **Export/Import**: Backup and restore notes
6. **Timestamps**: Show creation and modification dates
7. **User Authentication**: Personal note spaces