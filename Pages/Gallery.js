import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Loader2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Gallery() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: artifacts = [], isLoading } = useQuery({
        queryKey: ['artifacts'],
        queryFn: () => base44.entities.Artifact.list('-created_date')
    });

    const filteredArtifacts = artifacts.filter(artifact => {
        const query = searchQuery.toLowerCase();
        return (
            artifact.name?.toLowerCase().includes(query) ||
            artifact.description?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#E8F4ED] to-[#D4E9DE]">
            {/* Header */}
            <div className="bg-white/60 backdrop-blur-lg border-b border-[#D4E9DE] sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1B4D3E] mb-4">
                        Artifact Gallery
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D5F4C]" />
                        <Input
                            type="text"
                            placeholder="Search artifacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 border-[#5DB075] focus:ring-[#5DB075] bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#5DB075] animate-spin mb-4" />
                        <p className="text-[#2D5F4C] text-lg">Loading artifacts...</p>
                    </div>
                ) : filteredArtifacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <ImageIcon className="w-16 h-16 text-[#5DB075] mb-4" />
                        <p className="text-[#2D5F4C] text-lg">
                            {searchQuery ? 'No artifacts found' : 'No artifacts yet. Start documenting!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArtifacts.map((artifact) => (
                            <Link key={artifact.id} to={createPageUrl('ArtifactView') + `?id=${artifact.id}`}>
                                <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur"
                                >
                                <div className="relative h-64 overflow-hidden bg-[#D4E9DE]">
                                    <img
                                        src={artifact.photo_url}
                                        alt={artifact.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-semibold text-[#1B4D3E] mb-2 line-clamp-1">
                                        {artifact.name || 'Untitled Artifact'}
                                    </h3>
                                    {artifact.description && (
                                        <p className="text-[#2D5F4C] text-sm line-clamp-2 mb-3">
                                            {artifact.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-[#2D5F4C]">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>
                                                {artifact.latitude.toFixed(4)}, {artifact.longitude.toFixed(4)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                {format(new Date(artifact.discovery_date), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
