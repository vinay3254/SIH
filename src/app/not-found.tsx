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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] text-[#1D1D1F] p-4 font-sans">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-2">
                    <h1 className="text-8xl font-semibold text-gray-300 tracking-[-0.03em]">404</h1>
                </div>

                <h2 className="text-2xl font-semibold mb-3 tracking-tight">Page Not Found</h2>
                <p className="text-gray-500 mb-8 text-sm">
                    The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center justify-center gap-2 bg-[#0071E3] text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-sm shadow-sm"
                    >
                        <Icon name="ArrowLeftIcon" size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#1D1D1F] px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-sm shadow-sm"
                    >
                        <Icon name="HomeIcon" size={16} />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
