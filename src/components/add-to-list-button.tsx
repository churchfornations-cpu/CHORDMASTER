'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HymnList } from '@/lib/types'

export function AddToListButton({ hymnId }: { hymnId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [lists, setLists] = useState<HymnList[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            const fetchLists = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('hymn_lists')
                    .select('*')
                    .eq('user_id', user.id)

                if (data) setLists(data)
            }
            fetchLists()
        }
    }, [isOpen])

    const handleAdd = async (listId: string) => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('list_items')
                .insert({ list_id: listId, hymn_id: hymnId })

            if (error) {
                if (error.code === '23505') { // Unique violation if I added constraint, otherwise logic ok
                    alert("Already in list")
                } else {
                    throw error
                }
            } else {
                setIsOpen(false)
                alert("Added to list!")
            }
        } catch (e) {
            console.error(e)
            alert("Failed to add to list")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-2 rounded-full bg-black/50 hover:bg-[#FF5500] text-white transition-colors"
                title="Add to List"
            >
                <Plus className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); }}
                    />
                    <div className="absolute right-0 bottom-full mb-2 w-56 z-50 bg-[#171717] border border-white/10 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-white/5">
                            <span className="text-xs font-bold text-gray-400 uppercase">Add to List</span>
                            <X className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); setIsOpen(false) }} />
                        </div>

                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {lists.length === 0 ? (
                                <p className="px-2 py-2 text-sm text-gray-500 text-center">No lists found. Create one in Library.</p>
                            ) : (
                                lists.map((list) => (
                                    <button
                                        key={list.id}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(list.id); }}
                                        disabled={loading}
                                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors truncate"
                                    >
                                        {list.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
