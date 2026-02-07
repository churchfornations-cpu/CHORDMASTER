'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreateListModal({ currentCount }: { currentCount: number }) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleCreate = async () => {
        if (!name.trim()) return
        if (currentCount >= 3) {
            alert("You have reached the maximum limit of 3 lists.")
            return
        }

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('hymn_lists')
                .insert({ name, user_id: user.id })

            if (error) throw error

            setIsOpen(false)
            setName('')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to create list')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-[#00FF00] hover:bg-[#00CC00] text-black px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(0,255,0,0.3)]"
            >
                <Plus className="w-5 h-5" />
                <span>New List</span>
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Create New List</h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">List Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sunday Service"
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FF5500] focus:outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-3 rounded-lg font-medium text-gray-300 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={loading || !name.trim()}
                            className="flex-1 py-3 rounded-lg font-bold text-black bg-[#FF5500] hover:bg-[#CC4400] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create List'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
