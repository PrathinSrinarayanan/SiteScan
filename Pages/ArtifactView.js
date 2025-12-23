import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Calendar, Target, User, Share2, QrCode, Loader2, Pencil, Hash, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ArtifactView() {
    const [showQR, setShowQR] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [editForm, setEditForm] = React.useState({});
    const urlParams = new URLSearchParams(window.location.search);
    const artifactId = urlParams.get('id');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: artifact, isLoading, error } = useQuery({
        queryKey: ['artifact', artifactId],
        queryFn: async () => {
            const artifacts = await base44.entities.Artifact.list();
            return artifacts.find(a => a.id === artifactId);
        },
        enabled: !!artifactId
    });

    const updateMutation = useMutation({
        mutationFn: (data) => base44.entities.Artifact.update(artifactId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artifact', artifactId] });
            queryClient.invalidateQueries({ queryKey: ['artifacts'] });
            setIsEditing(false);
            toast.success('Artifact updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => base44.entities.Artifact.delete(artifactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artifacts'] });
            toast.success('Artifact deleted');
            navigate(createPageUrl('Gallery'));
        }
    });

    React.useEffect(() => {
        if (artifact) {
            setEditForm({
                name: artifact.name || '',
                description: artifact.description || '',
                color: artifact.color || '#2D5F4C',
                extracted_text: artifact.extracted_text || ''
            });
        }
    }, [artifact]);

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
    const artifactColor = artifact.color || '#2D5F4C';

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
                                onClick={() => setIsEditing(true)}
                                variant="ghost"
                                size="icon"
                                className="bg-white/90 hover:bg-white shadow-lg rounded-full"
                            >
                                <Pencil className="w-5 h-5" style={{ color: artifactColor }} />
                            </Button>
                            <Button
                                onClick={() => setShowQR(true)}
                                variant="ghost"
                                size="icon"
                                className="bg-white/90 hover:bg-white shadow-lg rounded-full"
                            >
                                <QrCode className="w-5 h-5" style={{ color: artifactColor }} />
                            </Button>
                            <Button
                                onClick={handleShare}
                                variant="ghost"
                                size="icon"
                                className="bg-white/90 hover:bg-white shadow-lg rounded-full"
                            >
                                <Share2 className="w-5 h-5" style={{ color: artifactColor }} />
                            </Button>
                            <Button
                                onClick={() => setShowDeleteConfirm(true)}
                                variant="ghost"
                                size="icon"
                                className="bg-white/90 hover:bg-white shadow-lg rounded-full"
                            >
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </Button>
                        </div>

                        {/* Image */}
                        <div className="relative h-96" style={{ backgroundColor: `${artifactColor}15` }}>
                            <img
                                src={artifact.photo_url}
                                alt={artifact.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <CardContent className="p-8">
                            {/* ID Number */}
                            {artifact.id_number && (
                                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: `${artifactColor}10` }}>
                                    <Hash className="w-5 h-5" style={{ color: artifactColor }} />
                                    <span className="font-mono font-semibold text-lg" style={{ color: artifactColor }}>
                                        {artifact.id_number}
                                    </span>
                                </div>
                            )}

                            {/* Title */}
                            <h2 className="text-3xl font-serif font-bold mb-6" style={{ color: artifactColor }}>
                                {artifact.name || 'Untitled Artifact'}
                            </h2>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: `${artifactColor}10` }}>
                                    <Calendar className="w-5 h-5 mt-1" style={{ color: artifactColor }} />
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

                                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: `${artifactColor}10` }}>
                                    <MapPin className="w-5 h-5 mt-1" style={{ color: artifactColor }} />
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
                                                className="block text-xs hover:underline"
                                                style={{ color: artifactColor }}
                                                >
                                                🗺️ Open in Google Maps →
                                                </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: `${artifactColor}10` }}>
                                    <Target className="w-5 h-5 mt-1" style={{ color: artifactColor }} />
                                    <div>
                                        <p className="text-xs text-[#2D5F4C] mb-1">Location Accuracy</p>
                                        <p className="text-[#1B4D3E] font-medium">
                                            ±{artifact.location_accuracy?.toFixed(1)} meters
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: `${artifactColor}10` }}>
                                    <User className="w-5 h-5 mt-1" style={{ color: artifactColor }} />
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

                            {/* Extracted Text */}
                            {artifact.extracted_text && (
                                <div className="pt-6" style={{ borderTop: `1px solid ${artifactColor}30` }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-5 h-5" style={{ color: artifactColor }} />
                                        <h3 className="text-lg font-semibold" style={{ color: artifactColor }}>
                                            Extracted Text / Inscriptions
                                        </h3>
                                    </div>
                                    <div className="p-4 rounded-lg" style={{ backgroundColor: `${artifactColor}10` }}>
                                        <p className="text-[#1B4D3E] leading-relaxed whitespace-pre-wrap font-mono text-sm">
                                            {artifact.extracted_text}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Map Preview */}
                            <div className="pt-6 mt-6" style={{ borderTop: `1px solid ${artifactColor}30` }}>
                                <h3 className="text-lg font-semibold mb-3" style={{ color: artifactColor }}>
                                    Location Preview
                                </h3>
                                <div className="relative h-64 rounded-lg overflow-hidden" style={{ backgroundColor: `${artifactColor}15` }}>
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
            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle style={{ color: artifactColor }}>Edit Artifact</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                style={{ borderColor: `${artifactColor}50` }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                rows={4}
                                style={{ borderColor: `${artifactColor}50` }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-extracted-text">Extracted Text / Inscriptions</Label>
                            <Textarea
                                id="edit-extracted-text"
                                value={editForm.extracted_text}
                                onChange={(e) => setEditForm({ ...editForm, extracted_text: e.target.value })}
                                rows={4}
                                style={{ borderColor: `${artifactColor}50` }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-color">Theme Color</Label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    id="edit-color"
                                    value={editForm.color}
                                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                    className="h-10 w-16 rounded cursor-pointer"
                                    style={{ borderColor: artifactColor }}
                                />
                                <span className="text-sm text-gray-600">{editForm.color}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => updateMutation.mutate(editForm)}
                                disabled={updateMutation.isPending}
                                style={{ backgroundColor: artifactColor }}
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Artifact</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-[#1B4D3E] mb-4">
                            Are you sure you want to delete this artifact? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle style={{ color: artifactColor }}>QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <img 
                            src={qrCodeImageUrl} 
                            alt="QR Code" 
                            className="w-64 h-64 border-4 rounded-lg"
                            style={{ borderColor: artifactColor }}
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
                                style={{ backgroundColor: artifactColor }}
                                >
                                Download QR Code
                                </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
