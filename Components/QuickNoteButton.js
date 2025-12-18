import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StickyNote, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function QuickNoteButton() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const queryClient = useQueryClient();

    const createNoteMutation = useMutation({
        mutationFn: (noteData) => base44.entities.Note.create(noteData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            toast.success('Note saved');
            setContent('');
            setIsPrivate(false);
            setOpen(false);
        },
        onError: () => {
            toast.error('Failed to save note');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error('Please enter a note');
            return;
        }
        createNoteMutation.mutate({ content, is_private: isPrivate });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2"
                >
                    <StickyNote className="w-5 h-5" />
                    <span className="font-medium hidden md:block">Quick Note</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-[#1B4D3E]">Add Quick Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <Textarea
                        placeholder="What's happening? Observations, findings, reminders..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="resize-none border-[#5DB075] focus:ring-[#5DB075]"
                        autoFocus
                    />
                    <div className="flex items-center justify-between p-3 bg-[#F0F7F4] rounded-lg">
                        <Label htmlFor="private-mode" className="text-[#1B4D3E] font-medium cursor-pointer">
                            Private Note
                        </Label>
                        <Switch
                            id="private-mode"
                            checked={isPrivate}
                            onCheckedChange={setIsPrivate}
                        />
                    </div>
                    <p className="text-xs text-[#2D5F4C]">
                        {isPrivate ? '🔒 Only you can see this note' : '👥 This note is visible to all team members'}
                    </p>
                    <Button
                        type="submit"
                        disabled={createNoteMutation.isPending}
                        className="w-full bg-[#5DB075] hover:bg-[#4A9D65]"
                    >
                        {createNoteMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Note'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
