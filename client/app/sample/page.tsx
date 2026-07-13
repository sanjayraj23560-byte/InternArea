'use client';

import React, { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function HelloWorldDownloader() {
    // 1. Create a hook reference to grab our specific element box later
    const helloBoxRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!helloBoxRef.current) return;

        try {
            setLoading(true);

            // 2. Load html2canvas dynamically so it only runs on the client browser
            const html2canvas = (await import('html2canvas-pro')).default;

            // 3. Take a visual snapshot of our referenced "Hello World" div element
            const canvas = await html2canvas(helloBoxRef.current, {
                scale: 2, // Double resolution for ultra-sharp text lines
                backgroundColor: '#ffffff', // Clean crisp white backing
            });

            // 4. Convert the snapshot canvas into a downloadable link path
            const imageURL = canvas.toDataURL('image/png');

            // 5. Fire a discrete virtual click to save the file to your computer
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = 'hello-world.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Failed to generate image:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-sm mx-auto space-y-4 text-center mt-40">

            {/* 🌟 ONLY this specific box container gets captured into your png file! */}
            <div
                ref={helloBoxRef}
                className="p-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-md"
            >
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Hello World!
                </h1>
                <p className="text-blue-100 text-xs mt-2 font-medium">
                    A internArea product
                </p>
            </div>

            {/* Trigger download button outside the target container element area */}
            <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Image...
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        Download Hello World PNG
                    </>
                )}
            </button>
        </div>
    );
}