import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Camera, Grid3x3, StickyNote, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import QuickNoteButton from './components/QuickNoteButton';
import ChatBot from './components/ChatBot';
import { ThemeProvider, useTheme } from './components/ThemeProvider';

function LayoutContent({ children, currentPageName }) {
    const { themeColor } = useTheme();
    const navItems = [
        { name: 'Capture', icon: Camera, path: 'Capture' },
        { name: 'Gallery', icon: Grid3x3, path: 'Gallery' },
        { name: 'Notes', icon: StickyNote, path: 'Notes' }
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: `${themeColor}08` }}>
            {/* Navigation */}
            <nav className="shadow-lg" style={{ background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)` }}>
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to={createPageUrl('Capture')} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${themeColor}cc` }}>
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white font-serif text-xl font-bold hidden md:block">
                                SiteScan
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentPageName === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={createPageUrl(item.path)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium hidden md:block">{item.name}</span>
                                    </Link>
                                    );
                                    })}
                                    <QuickNoteButton />
                                    <Button
                                onClick={() => base44.auth.logout()}
                                variant="ghost"
                                className="text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium hidden md:block">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main>{children}</main>

            {/* ChatBot */}
            <ChatBot />
            </div>
            );
            }

            export default function Layout({ children, currentPageName }) {
            return (
            <ThemeProvider>
                <LayoutContent children={children} currentPageName={currentPageName} />
            </ThemeProvider>
            );
            }
