'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function NotFound() {
    const router = useRouter();

    const handleGoHome = () => {
        router?.push('/');
    };

    const handleGoBack = () => {
        if (typeof window !== 'undefined') {
            window.history?.back();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <h1 className="text-9xl font-bold text-cyan-500 opacity-20 font-mono">404</h1>
                    </div>
                </div>

                <h2 className="text-2xl font-medium text-gray-100 mb-2">Page Not Found</h2>
                <p className="text-gray-400 mb-8 text-sm">
                    The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center justify-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-cyan-500 transition-colors duration-200 text-xs shadow-lg shadow-cyan-600/30"
                    >
                        <Icon name="ArrowLeftIcon" size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="inline-flex items-center justify-center gap-2 border border-gray-800 bg-gray-900 text-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200 text-xs"
                    >
                        <Icon name="HomeIcon" size={16} />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
