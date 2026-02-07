'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquarePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface RequestHymnModalProps {
    trigger?: React.ReactNode
}

export function RequestHymnModal({ trigger }: RequestHymnModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [artist, setArtist] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [mounted, setMounted] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('Please login to make a request')
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from('requests')
            .insert({
                user_id: user.id,
                title: title.trim(),
                artist: artist.trim() || null
            })

        if (!error) {
            setSuccess(true)
            setTitle('')
            setArtist('')
            setTimeout(() => {
                setSuccess(false)
                setIsOpen(false)
            }, 2000)
        } else {
            alert('Failed to submit request')
        }
        setLoading(false)
    }

    if (!isOpen) {
        if (trigger) {
            return <div onClick={() => setIsOpen(true)}>{trigger}</div>
        }
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-40 bg-[#FF5500] hover:bg-[#FF3300] text-black font-bold p-4 rounded-full shadow-[0_0_20px_rgba(255,85,0,0.4)] transition-all hover:scale-110 flex items-center gap-2 group md:bottom-8 md:left-8"
            >
                <MessageSquarePlus className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">Request Hymn</span>
            </button>
        )
    }

    // Portal content
    const content = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Request a Hymn</h2>
                <p className="text-gray-400 text-sm mb-6">Can't find a song? Let the admins know what to add next.</p>

                {success ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center animate-in fade-in zoom-in">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black">
                            <MessageSquarePlus className="w-6 h-6" />
                        </div>
                        <h3 className="text-green-500 font-bold text-lg mb-1">Request Sent!</h3>
                        <p className="text-gray-400 text-sm">We'll review it shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Song Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Way Maker"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5500] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Artist (Optional)</label>
                            <input
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="e.g. Sinach"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5500] transition-colors"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !title.trim()}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg",
                                    loading || !title.trim()
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                        : "bg-[#FF5500] text-black hover:bg-[#FF3300] hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(255,85,0,0.3)]"
                                )}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </span>
                                ) : "Submit Request"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )

    if (mounted) {
        return createPortal(content, document.body)
    }

    return null
}
