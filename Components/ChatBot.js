import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const { data: artifacts = [] } = useQuery({
        queryKey: ['artifacts'],
        queryFn: () => base44.entities.Artifact.list()
    });

    const { data: notes = [] } = useQuery({
        queryKey: ['notes'],
        queryFn: () => base44.entities.Note.list()
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const context = `You are a helpful assistant for an archaeological documentation app called SiteScan. Answer questions about the artifacts and notes data below.

ARTIFACTS DATA:
${JSON.stringify(artifacts, null, 2)}

NOTES DATA:
${JSON.stringify(notes, null, 2)}

User question: ${userMessage}

Provide a helpful, concise answer based on the data above.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: context
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#5DB075] hover:bg-[#4A9D65] shadow-2xl z-50"
            >
                <MessageCircle className="w-6 h-6 text-white" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl border-2 border-[#5DB075] z-50 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1B4D3E] to-[#2D5F4C] text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">SiteScan Assistant</span>
                </div>
                <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-[#2D5F4C] py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[#5DB075]" />
                        <p className="font-medium mb-2">Ask me anything!</p>
                        <p className="text-sm">I can help you with questions about your artifacts and notes.</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                msg.role === 'user'
                                    ? 'bg-[#5DB075] text-white'
                                    : 'bg-[#F0F7F4] text-[#1B4D3E]'
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#F0F7F4] rounded-2xl px-4 py-3">
                            <Loader2 className="w-5 h-5 text-[#5DB075] animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#D4E9DE]">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your data..."
                        className="flex-1 border-[#5DB075] focus:ring-[#5DB075]"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-[#5DB075] hover:bg-[#4A9D65]"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
