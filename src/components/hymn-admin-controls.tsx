'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

import { deleteHymn, updateHymnTitle } from '@/app/actions'

interface HymnAdminControlsProps {
    hymnId: string
    initialTitle: string
    role: string | null
}

export function HymnAdminControls({ hymnId, initialTitle, role }: HymnAdminControlsProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(initialTitle)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (role !== 'super_admin') return null

    const handleUpdate = async () => {
        if (!title.trim()) {
            alert('Title cannot be empty')
            return
        }

        if (title === initialTitle) {
            setIsEditing(false)
            return
        }

        setLoading(true)
        try {
            await updateHymnTitle(hymnId, title.trim())
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to update title')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this hymn?\nThis action cannot be undone.')) return

        setLoading(true)
        try {
            await deleteHymn(hymnId)
            router.push('/')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to delete hymn')
            setLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center justify-center gap-2 mb-6 animate-in fade-in zoom-in duration-200">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-[#FF5500] outline-none min-w-[200px] text-center font-bold text-xl md:text-2xl"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate()
                        if (e.key === 'Escape') setIsEditing(false)
                    }}
                />
                {/* ... buttons ... */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="p-2 text-green-500 hover:text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-full transition-colors"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false)
                            setTitle(initialTitle)
                        }}
                        disabled={loading}
                        className="p-2 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center gap-3 mt-4 mb-8 animate-in fade-in duration-300">
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-full transition-all"
            >
                <Pencil className="w-4 h-4" />
                <span>Rename</span>
            </button>
            <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-full transition-all"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete</span>
            </button>
        </div>
    )
}
