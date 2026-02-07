'use client'

import { useState } from 'react'
import { LayoutGrid, Grip, Grid3x3, List, AlignJustify } from 'lucide-react'
import { Hymn } from '@/lib/types'
import Link from 'next/link'
import { AddToListButton } from './add-to-list-button'
import { cn } from '@/lib/utils'

import { FavoriteButton } from './favorite-button'

type ViewMode = 'small' | 'medium' | 'large' | 'list' | 'details'

interface FeedRendererProps {
    hymns: Hymn[]
}

export function FeedRenderer({ hymns }: FeedRendererProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('medium')

    return (
        <div className="space-y-6">
            {/* View Controls */}
            <div className="flex justify-end gap-2 bg-[#171717]/50 backdrop-blur-sm p-2 rounded-lg border border-white/5 w-fit ml-auto">
                <button
                    onClick={() => setViewMode('small')}
                    className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === 'small' ? "bg-[#00FF00] text-black shadow-[0_0_10px_rgba(0,255,0,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                    title="Small Grid"
                >
                    <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('medium')}
                    className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === 'medium' ? "bg-[#00FF00] text-black shadow-[0_0_10px_rgba(0,255,0,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                    title="Medium Grid"
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('large')}
                    className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === 'large' ? "bg-[#00FF00] text-black shadow-[0_0_10px_rgba(0,255,0,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                    title="Large Grid"
                >
                    <Grip className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === 'list' ? "bg-[#00FF00] text-black shadow-[0_0_10px_rgba(0,255,0,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                    title="List View"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('details')}
                    className={cn(
                        "p-2 rounded-md transition-all",
                        viewMode === 'details' ? "bg-[#00FF00] text-black shadow-[0_0_10px_rgba(0,255,0,0.3)]" : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                    title="Detailed List"
                >
                    <AlignJustify className="w-4 h-4" />
                </button>
            </div>

            {/* Grid Views */}
            {(viewMode === 'small' || viewMode === 'medium' || viewMode === 'large') && (
                <div className={cn(
                    "grid gap-6",
                    viewMode === 'small' && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
                    viewMode === 'medium' && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                    viewMode === 'large' && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
                )}>
                    {hymns.map((hymn) => (
                        <div key={hymn.id} className="group relative break-inside-avoid rounded-xl border border-white/10 bg-[#171717] overflow-hidden hover:border-[#FF5500] transition-all hover:shadow-[0_0_30px_rgba(255,85,0,0.15)]">
                            <Link href={`/hymn/${hymn.id}`} className="block relative aspect-[3/4] w-full overflow-hidden cursor-pointer">
                                <img
                                    src={hymn.image_url}
                                    alt={hymn.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className={cn(
                                                "font-bold text-white line-clamp-2",
                                                viewMode === 'small' ? "text-sm" : "text-lg"
                                            )}>{hymn.title}</h3>
                                            <p className="text-xs text-[#00FF00] font-medium mt-1">View Chord Sheet</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <div className="absolute bottom-3 right-3 z-10 md:hidden flex gap-2">
                                <FavoriteButton hymnId={hymn.id} />
                                <AddToListButton hymnId={hymn.id} />
                            </div>
                            <div className="absolute bottom-4 right-4 z-10 hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FavoriteButton hymnId={hymn.id} />
                                <AddToListButton hymnId={hymn.id} />
                            </div>

                            <div className="p-3 md:hidden flex justify-between items-center bg-[#171717] relative z-0">
                                <Link href={`/hymn/${hymn.id}`} className="flex-1 truncate">
                                    <h3 className="text-sm font-bold text-white truncate">{hymn.title}</h3>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="space-y-2">
                    {hymns.map((hymn) => (
                        <div key={hymn.id} className="flex items-center justify-between bg-[#171717] p-4 rounded-lg border border-white/5 hover:border-[#FF5500] hover:bg-white/5 transition-all group">
                            <Link href={`/hymn/${hymn.id}`} className="flex items-center gap-4 flex-1">
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
                                    <img src={hymn.image_url} alt={hymn.title} className="w-full h-full object-cover" />
                                </div>
                                <span className="font-medium text-white group-hover:text-[#FF5500] transition-colors">{hymn.title}</span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <Link href={`/hymn/${hymn.id}`} className="text-xs text-gray-500 hover:text-white hidden sm:block">
                                    View
                                </Link>
                                <FavoriteButton hymnId={hymn.id} />
                                <AddToListButton hymnId={hymn.id} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detailed View */}
            {viewMode === 'details' && (
                <div className="space-y-4">
                    {hymns.map((hymn) => (
                        <div key={hymn.id} className="flex flex-col sm:flex-row bg-[#171717] rounded-xl border border-white/5 overflow-hidden hover:border-[#FF5500] hover:shadow-lg transition-all group">
                            <Link href={`/hymn/${hymn.id}`} className="sm:w-48 aspect-video sm:aspect-square bg-zinc-800 relative overflow-hidden">
                                <img src={hymn.image_url} alt={hymn.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </Link>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <Link href={`/hymn/${hymn.id}`}>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF5500] transition-colors">{hymn.title}</h3>
                                    </Link>
                                    <p className="text-sm text-gray-400 line-clamp-2">
                                        Click to view the full chord sheet, transpose, and more.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                                    <span className="text-xs text-gray-500">Added {new Date(hymn.created_at).toLocaleDateString()}</span>

                                    <div className="flex items-center gap-3">
                                        <Link href={`/hymn/${hymn.id}`} className="text-sm font-medium text-[#00FF00] hover:underline">
                                            Open Sheet
                                        </Link>
                                        <FavoriteButton hymnId={hymn.id} />
                                        <AddToListButton hymnId={hymn.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {hymns.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-xl text-gray-400 font-medium">No results found.</p>
                </div>
            )}
        </div>
    )
}
