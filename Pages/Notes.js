import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Lock, Users, Calendar, Loader2, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function Notes() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: () => base44.entities.Note.list('-created_date')
    });

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = 
            filter === 'all' || 
            (filter === 'private' && note.is_private) ||
            (filter === 'public' && !note.is_private);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#E8F4ED] to-[#D4E9DE]">
            {/* Header */}
            <div className="bg-white/60 backdrop-blur-lg border-b border-[#D4E9DE] sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1B4D3E] mb-4">
                        Field Notes
                    </h1>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D5F4C]" />
                            <Input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 border-[#5DB075] focus:ring-[#5DB075] bg-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    filter === 'all' 
                                        ? 'bg-[#5DB075] text-white' 
                                        : 'bg-white text-[#2D5F4C] hover:bg-[#F0F7F4]'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('private')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    filter === 'private' 
                                        ? 'bg-[#5DB075] text-white' 
                                        : 'bg-white text-[#2D5F4C] hover:bg-[#F0F7F4]'
                                }`}
                            >
                                Private
                            </button>
                            <button
                                onClick={() => setFilter('public')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    filter === 'public' 
                                        ? 'bg-[#5DB075] text-white' 
                                        : 'bg-white text-[#2D5F4C] hover:bg-[#F0F7F4]'
                                }`}
                            >
                                Public
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes List */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#5DB075] animate-spin mb-4" />
                        <p className="text-[#2D5F4C] text-lg">Loading notes...</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <StickyNote className="w-16 h-16 text-[#5DB075] mb-4" />
                        <p className="text-[#2D5F4C] text-lg">
                            {searchQuery ? 'No notes found' : 'No notes yet. Use Quick Note to add one!'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotes.map((note) => (
                            <Card key={note.id} className="bg-white/90 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <Badge className={note.is_private ? 'bg-[#1B4D3E] text-white' : 'bg-[#5DB075] text-white'}>
                                            {note.is_private ? (
                                                <>
                                                    <Lock className="w-3 h-3 mr-1" />
                                                    Private
                                                </>
                                            ) : (
                                                <>
                                                    <Users className="w-3 h-3 mr-1" />
                                                    Public
                                                </>
                                            )}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-xs text-[#2D5F4C]">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(note.created_date), 'MMM d, yyyy h:mm a')}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[#1B4D3E] leading-relaxed whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                    <p className="text-xs text-[#2D5F4C] mt-3">
                                        By {note.created_by}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
