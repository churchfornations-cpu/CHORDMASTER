'use client'

import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HymnViewerProps {
    imageUrl: string
    title: string
}

export function HymnViewer({ imageUrl, title }: HymnViewerProps) {
    const [scale, setScale] = useState(1)
    const [rotation, setRotation] = useState(0)

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5))
    }

    const handleReset = () => {
        setScale(1)
        setRotation(0)
    }

    return (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
            {/* Controls */}
            <div className="flex items-center gap-4 mb-6 bg-[#171717] px-6 py-3 rounded-full border border-white/10 shadow-lg z-10 sticky top-20">
                <button
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 text-white"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5" />
                </button>

                <span className="text-sm font-medium text-gray-400 min-w-[3ch] text-center">
                    {Math.round(scale * 100)}%
                </span>

                <button
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 text-white"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-white/10 mx-2" />

                <button
                    onClick={handleReset}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    title="Reset View"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Image Container */}
            <div className="relative w-full overflow-auto bg-[#171717]/50 border border-white/5 rounded-xl shadow-2xl min-h-[50vh] flex items-center justify-center p-4">
                <motion.div
                    animate={{ scale, rotate: rotation }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="origin-center"
                    drag
                    dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                >
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-w-full max-h-[75vh] w-auto h-auto object-contain shadow-lg"
                        draggable={false}
                    />
                </motion.div>
            </div>

            <p className="mt-4 text-xs text-center text-gray-500">
                Tip: You can drag the image to pan when zoomed in.
            </p>

            <a
                href={imageUrl}
                download={title}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 text-sm text-[#00FF00] hover:underline"
            >
                Download Original Image
            </a>
        </div>
    )
}
