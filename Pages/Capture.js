import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, MapPin, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Capture() {
    const { themeColor } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [color, setColor] = useState('#2D5F4C');
    const [extractingText, setExtractingText] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [generatingDescription, setGeneratingDescription] = useState(false);

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
        setColor('#2D5F4C');
        setExtractedText('');
    };

    const handlePhotoChange = async (e) => {
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
            
            // Extract text and generate description
            await Promise.all([
                extractTextFromImage(file),
                generateDescription(file)
            ]);
        }
    };

    const extractTextFromImage = async (file) => {
        setExtractingText(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: 'Extract any visible text, symbols, inscriptions, or markings from this artifact image. If there is no text visible, respond with "No visible text detected". Be detailed and accurate.',
                file_urls: [file_url]
            });
            setExtractedText(result || 'No visible text detected');
        } catch (error) {
            setExtractedText('');
        } finally {
            setExtractingText(false);
        }
    };

    const generateDescription = async (file) => {
        setGeneratingDescription(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const result = await base44.integrations.Core.InvokeLLM({
                prompt: 'You are an archaeological expert. Analyze this artifact image and provide a detailed description including: material, condition, estimated period/culture if identifiable, notable features, and any significant archaeological context. Be professional and concise (3-5 sentences).',
                file_urls: [file_url]
            });
            setDescription(result || '');
            toast.success('AI analysis complete');
        } catch (error) {
            toast.error('Description generation failed');
        } finally {
            setGeneratingDescription(false);
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

            // Generate unique ID number
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const id_number = `ART-${timestamp}-${random}`;

            // Create artifact
            await createArtifactMutation.mutateAsync({
                id_number,
                name: name || 'Untitled Artifact',
                description,
                photo_url: file_url,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                location_accuracy: coordinates.accuracy,
                discovery_date: new Date().toISOString(),
                color: color,
                extracted_text: extractedText
            });
        } catch (error) {
            setUploadingPhoto(false);
            toast.error('Failed to upload photo');
        }
    };

    const isSubmitting = uploadingPhoto || createArtifactMutation.isPending;

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ background: `linear-gradient(to br, ${themeColor}08, ${themeColor}20)` }}>
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: themeColor }}>
                        SiteScan
                    </h1>
                    <p className="text-lg" style={{ color: `${themeColor}cc` }}>
                        Capture and preserve archaeological discoveries
                    </p>
                </div>

                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur">
                    <CardHeader style={{ borderBottom: `1px solid ${themeColor}30` }}>
                        <CardTitle className="flex items-center gap-2 text-2xl" style={{ color: themeColor }}>
                            <Camera className="w-6 h-6" style={{ color: themeColor }} />
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
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all group"
                                        style={{ 
                                            borderColor: themeColor,
                                            backgroundColor: photoPreview ? 'transparent' : `${themeColor}05`
                                        }}
                                    >
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <Camera className="w-12 h-12 group-hover:scale-110 transition-transform" style={{ color: themeColor }} />
                                                <span className="font-medium" style={{ color: themeColor }}>
                                                    Tap to capture photo
                                                </span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* AI Analysis Status */}
                            {photoFile && (
                                <div className="flex items-center gap-3 p-4 rounded-lg border" style={{ backgroundColor: `${themeColor}10`, borderColor: `${themeColor}30` }}>
                                    {(extractingText || generatingDescription) ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />
                                            <span className="text-[#1B4D3E]">AI analyzing artifact...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-[#1B4D3E] font-medium">AI analysis complete</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Extracted Text */}
                            {photoFile && extractedText && (
                                <div className="space-y-3">
                                    <Label htmlFor="extracted-text" className="text-[#1B4D3E] font-medium">
                                        Extracted Text / Inscriptions
                                    </Label>
                                    <Textarea
                                        id="extracted-text"
                                        value={extractedText}
                                        onChange={(e) => setExtractedText(e.target.value)}
                                        placeholder="Extracted text will appear here..."
                                        rows={4}
                                        className="resize-none"
                                        style={{ borderColor: `${themeColor}50` }}
                                    />
                                    <p className="text-xs text-[#2D5F4C]">
                                        You can edit the extracted text before saving
                                    </p>
                                </div>
                            )}

                            {/* Location Status */}
                            {photoFile && (
                                <div className="flex items-center gap-3 p-4 rounded-lg border" style={{ backgroundColor: `${themeColor}10`, borderColor: `${themeColor}30` }}>
                                    {gettingLocation ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />
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
                                                style={{ backgroundColor: themeColor }}
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
                                    className="text-lg"
                                    style={{ borderColor: `${themeColor}50` }}
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
                                    placeholder="AI-generated description will appear here..."
                                    rows={6}
                                    className="resize-none"
                                    style={{ borderColor: `${themeColor}50` }}
                                    disabled={generatingDescription}
                                />
                                <p className="text-xs text-[#2D5F4C]">
                                    AI-generated description - you can edit before saving
                                </p>
                                    </div>

                                    {/* Color Picker */}
                                    <div className="space-y-3">
                                    <Label htmlFor="color" className="text-[#1B4D3E] font-medium">
                                    Theme Color
                                    </Label>
                                    <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        id="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="h-12 w-20 rounded-lg cursor-pointer border-2"
                                        style={{ borderColor: themeColor }}
                                        />
                                    <span className="text-sm text-[#2D5F4C]">{color}</span>
                                    </div>
                                    </div>

                                    {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || !photoFile || !coordinates}
                                className="w-full text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                style={{ backgroundColor: themeColor }}
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
