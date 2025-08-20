import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { notesApi, isSupabaseConfigured, Note } from '@/lib/supabase';
import { Plus, Trash2, Edit, Save, X, Database, AlertCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const NotesManager: React.FC = () => {
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const queryClient = useQueryClient();

  // Query for fetching notes
  const { data: notes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: notesApi.getNotes,
    enabled: isSupabaseConfigured,
    retry: 2,
  });

  // Mutation for adding notes
  const addNoteMutation = useMutation({
    mutationFn: notesApi.addNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNewNoteTitle('');
      toast.success('Note added successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });

  // Mutation for deleting notes
  const deleteNoteMutation = useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });

  // Mutation for updating notes
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => 
      notesApi.updateNote(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingId(null);
      setEditingTitle('');
      toast.success('Note updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteTitle.trim()) {
      addNoteMutation.mutate(newNoteTitle);
    }
  };

  const handleDeleteNote = (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editingTitle.trim()) {
      updateNoteMutation.mutate({ id: editingId, title: editingTitle });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // If Supabase is not configured, show setup instructions
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Database className="w-5 h-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription className="text-amber-700">
              To use the Notes feature, you need to configure Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-amber-800">
            <div className="space-y-2">
              <h4 className="font-semibold">Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">supabase.com</a></li>
                <li>Copy your project URL and anon key from the dashboard</li>
                <li>Add them to your .env file:</li>
              </ol>
            </div>
            <div className="bg-amber-100 p-3 rounded-md font-mono text-xs">
              VITE_SUPABASE_URL=your_supabase_project_url<br />
              VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Database Schema:</h4>
              <div className="bg-amber-100 p-3 rounded-md font-mono text-xs">
                create table notes (<br />
                &nbsp;&nbsp;id bigint primary key generated always as identity,<br />
                &nbsp;&nbsp;title text not null<br />
                );<br />
                <br />
                alter table notes enable row level security;
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Notes Manager
          </CardTitle>
          <CardDescription>
            Create and manage your personal notes with Supabase integration.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add Note Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Note</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="noteTitle">Note Title</Label>
              <Input
                id="noteTitle"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Enter your note title..."
                disabled={addNoteMutation.isPending}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newNoteTitle.trim() || addNoteMutation.isPending}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load notes: {error.message}
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-red-600" 
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Notes
            <Badge variant="secondary">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notes yet. Add your first note above!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.id}</TableCell>
                    <TableCell>
                      {editingId === note.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="break-words">{note.title}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === note.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={updateNoteMutation.isPending}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={deleteNoteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Demo Data Button */}
      {isSupabaseConfigured && notes.length === 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-blue-800 text-sm">
                Want to see some sample data? Click below to add the demo notes from the problem statement.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const demoNotes = [
                    'Today I created a Supabase project.',
                    'I added some data and queried it from Next.js.',
                    'It was awesome!'
                  ];
                  
                  demoNotes.forEach(title => {
                    addNoteMutation.mutate(title);
                  });
                }}
                disabled={addNoteMutation.isPending}
                className="text-blue-800 border-blue-300 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Demo Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotesManager;