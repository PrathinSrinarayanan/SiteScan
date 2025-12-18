import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Calendar, Target, User, Share2, QrCode, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ArtifactView() {
    const [showQR, setShowQR] = React.useState(false);
    const urlParams = new URLSearchParams(window.location.search);
    const artifactId = urlParams.get('id');

    const { data: artifact, isLoading, error } = useQuery({
        queryKey: ['artifact', artifactId],
        queryFn: async () => {
            const artifacts = await base44.entities.Artifact.list();
            return artifacts.find(a => a.id === artifactId);
        },
        enabled: !!artifactId
    });

    if (!artifactId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#E8F4ED] to-[#D4E9DE] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#1B4D3E] text-lg mb-4">No artifact selected</p>
                    <Link to={createPageUrl('Gallery')}>
                        <Button className="bg-[#5DB075] hover:bg-[#4A9D65]">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Gallery
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#E8F4ED] to-[#D4E9DE] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#5DB075] animate-spin" />
            </div>
        );
    }

    if (!artifact) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#E8F4ED] to-[#D4E9DE] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#1B4D3E] text-lg mb-4">Artifact not found</p>
                    <Link to={createPageUrl('Gallery')}>
                        <Button className="bg-[#5DB075] hover:bg-[#4A9D65]">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Gallery
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${artifact.latitude},${artifact.longitude}`;
    const artifactUrl = window.location.href;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(artifactUrl)}`;

    const handleShare = async () => {
        const shareData = {
            title: artifact.name || 'Artifact Discovery',
            text: `Check out this archaeological artifact: ${artifact.name || 'Untitled Artifact'}${artifact.description ? '\n\n' + artifact.description : ''}`,
            url: artifactUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Shared successfully');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    toast.error('Failed to share');
                }
            }
        } else {
            navigator.clipboard.writeText(artifactUrl);
            toast.success('Link copied to clipboard');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#E8F4ED] to-[#D4E9DE]">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                <Link to={createPageUrl('Gallery')}>
                    <Button variant="ghost" className="mb-6 text-[#1B4D3E] hover:bg-white/60">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Gallery
                    </Button>
                </Link>

                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur">
                    <div className="relative">
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <Button
                                onClick={() => setShowQR(true)}
                                variant="ghost"
                                size="icon"
                                className="bg-white/90 hover:bg-white shadow-lg rounded-full"
                            >
                                <QrCode className="w-5 h-5 text-[#5DB075]" />
                            </Button>
                            <Button
                                onClick={handleShare}
                                variant="ghost"
                                size="icon"
                                className="bg-white/90 hover:bg-white shadow-lg rounded-full"
                            >
                                <Share2 className="w-5 h-5 text-[#5DB075]" />
                            </Button>
                        </div>

                        {/* Image */}
                        <div className="relative h-96 bg-[#D4E9DE]">
                            <img
                                src={artifact.photo_url}
                                alt={artifact.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <CardContent className="p-8">
                            {/* Title */}
                            <h2 className="text-3xl font-serif font-bold text-[#1B4D3E] mb-6">
                                {artifact.name || 'Untitled Artifact'}
                            </h2>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-start gap-3 p-4 bg-[#F0F7F4] rounded-lg">
                                    <Calendar className="w-5 h-5 text-[#5DB075] mt-1" />
                                    <div>
                                        <p className="text-xs text-[#2D5F4C] mb-1">Discovery Date</p>
                                        <p className="text-[#1B4D3E] font-medium">
                                            {format(new Date(artifact.discovery_date), 'MMMM d, yyyy')}
                                        </p>
                                        <p className="text-xs text-[#2D5F4C]">
                                            {format(new Date(artifact.discovery_date), 'h:mm a')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-[#F0F7F4] rounded-lg">
                                    <MapPin className="w-5 h-5 text-[#5DB075] mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs text-[#2D5F4C] mb-1">GPS Coordinates</p>
                                        <div className="space-y-1">
                                            <a
                                                href={`https://www.google.com/maps?q=${artifact.latitude},${artifact.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-[#1B4D3E] font-medium font-mono text-sm hover:text-[#5DB075]"
                                            >
                                                📍 {artifact.latitude.toFixed(6)}, {artifact.longitude.toFixed(6)}
                                            </a>
                                            <a
                                                href={googleMapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-xs text-[#5DB075] hover:underline"
                                            >
                                                🗺️ Open in Google Maps →
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-[#F0F7F4] rounded-lg">
                                    <Target className="w-5 h-5 text-[#5DB075] mt-1" />
                                    <div>
                                        <p className="text-xs text-[#2D5F4C] mb-1">Location Accuracy</p>
                                        <p className="text-[#1B4D3E] font-medium">
                                            ±{artifact.location_accuracy?.toFixed(1)} meters
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-[#F0F7F4] rounded-lg">
                                    <User className="w-5 h-5 text-[#5DB075] mt-1" />
                                    <div>
                                        <p className="text-xs text-[#2D5F4C] mb-1">Documented By</p>
                                        <p className="text-[#1B4D3E] font-medium">
                                            {artifact.created_by || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {artifact.description && (
                                <div className="border-t border-[#D4E9DE] pt-6">
                                    <h3 className="text-lg font-semibold text-[#1B4D3E] mb-3">
                                        Description & Notes
                                    </h3>
                                    <p className="text-[#1B4D3E] leading-relaxed whitespace-pre-wrap">
                                        {artifact.description}
                                    </p>
                                </div>
                            )}

                            {/* Map Preview */}
                            <div className="border-t border-[#D4E9DE] pt-6 mt-6">
                                <h3 className="text-lg font-semibold text-[#1B4D3E] mb-3">
                                    Location Preview
                                </h3>
                                <div className="relative h-64 rounded-lg overflow-hidden bg-[#D4E9DE]">
                                    <iframe
                                        title="Location Map"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        src={`https://maps.google.com/maps?q=${artifact.latitude},${artifact.longitude}&output=embed`}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>

            {/* QR Code Dialog */}
            <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#1B4D3E]">QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <img 
                            src={qrCodeImageUrl} 
                            alt="QR Code" 
                            className="w-64 h-64 border-4 border-[#5DB075] rounded-lg"
                        />
                        <p className="text-sm text-[#2D5F4C] text-center">
                            Scan this QR code to view the artifact details
                        </p>
                        <Button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = qrCodeImageUrl;
                                link.download = `artifact_${artifact.name?.replace(/\s+/g, '_') || 'qrcode'}.png`;
                                link.click();
                                toast.success('QR code downloaded');
                            }}
                            className="bg-[#5DB075] hover:bg-[#4A9D65]"
                        >
                            Download QR Code
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
