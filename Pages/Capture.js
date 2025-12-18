import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Capture() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const queryClient = useQueryClient();

    const createArtifactMutation = useMutation({
        mutationFn: (artifactData) => base44.entities.Artifact.create(artifactData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artifacts'] });
            toast.success('Artifact saved successfully!');
            resetForm();
        },
        onError: () => {
            toast.error('Failed to save artifact');
        }
    });

    const resetForm = () => {
        setName('');
        setDescription('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setCoordinates(null);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Automatically get location when photo is selected
            getLocation();
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setGettingLocation(false);
                toast.success('Location captured');
            },
            (error) => {
                setGettingLocation(false);
                toast.error('Unable to get location. Please enable location services.');
                console.error(error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photoFile) {
            toast.error('Please select a photo');
            return;
        }

        if (!coordinates) {
            toast.error('Please capture location');
            return;
        }

        try {
            // Upload photo
            setUploadingPhoto(true);
            const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
            setUploadingPhoto(false);

            // Create artifact
            await createArtifactMutation.mutateAsync({
                name: name || 'Untitled Artifact',
                description,
                photo_url: file_url,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                location_accuracy: coordinates.accuracy,
                discovery_date: new Date().toISOString()
            });
        } catch (error) {
            setUploadingPhoto(false);
            toast.error('Failed to upload photo');
        }
    };

    const isSubmitting = uploadingPhoto || createArtifactMutation.isPending;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7F4] via-[#E8F4ED] to-[#D4E9DE] p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1B4D3E] mb-3">
                        SiteScan
                    </h1>
                    <p className="text-[#2D5F4C] text-lg">
                        Capture and preserve archaeological discoveries
                    </p>
                </div>

                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur">
                    <CardHeader className="border-b border-[#D4E9DE]">
                        <CardTitle className="flex items-center gap-2 text-2xl text-[#1B4D3E]">
                            <Camera className="w-6 h-6 text-[#5DB075]" />
                            New Discovery
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Photo Upload */}
                            <div className="space-y-3">
                                <Label className="text-[#6B4423] font-medium">Artifact Photo *</Label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#5DB075] rounded-xl cursor-pointer hover:bg-[#F0F7F4] transition-all group"
                                    >
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <Camera className="w-12 h-12 text-[#5DB075] group-hover:scale-110 transition-transform" />
                                                <span className="text-[#2D5F4C] font-medium">
                                                    Tap to capture photo
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Location Status */}
                            {photoFile && (
                                <div className="flex items-center gap-3 p-4 bg-[#F0F7F4] rounded-lg border border-[#D4E9DE]">
                                    {gettingLocation ? (
                                        <>
                                            <Loader2 className="w-5 h-5 text-[#5DB075] animate-spin" />
                                            <span className="text-[#1B4D3E]">Getting location...</span>
                                        </>
                                    ) : coordinates ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <div className="flex-1">
                                                <span className="text-[#1B4D3E] font-medium">Location captured</span>
                                                <p className="text-xs text-[#2D5F4C]">
                                                    {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-[#1B4D3E]">Location not captured</span>
                                            <Button
                                                type="button"
                                                onClick={getLocation}
                                                size="sm"
                                                className="bg-[#5DB075] hover:bg-[#4A9D65]"
                                            >
                                                <MapPin className="w-4 h-4 mr-1" />
                                                Get Location
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Artifact Name */}
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-[#1B4D3E] font-medium">
                                    Artifact Name
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Pottery Fragment, Stone Tool, etc."
                                    className="border-[#5DB075] focus:ring-[#5DB075] text-lg"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-[#1B4D3E] font-medium">
                                    Description & Notes
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the artifact, its condition, context, and any notable features..."
                                    rows={6}
                                    className="border-[#5DB075] focus:ring-[#5DB075] resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !photoFile || !coordinates}
                                className="w-full bg-[#5DB075] hover:bg-[#4A9D65] text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving to Cloud...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 mr-2" />
                                        Save Artifact
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
