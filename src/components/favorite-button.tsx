'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
    hymnId: string
    initialFavorited?: boolean
    userId: string
}

export function FavoriteButton({ hymnId, initialFavorited = false, userId }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const checkFavorite = async () => {
            if (!userId) return

            const { data } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', userId)
                .eq('hymn_id', hymnId)
                .single()

            if (data) setIsFavorited(true)
        }
        checkFavorite()
    }, [hymnId, supabase, userId])

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (loading) return
        setLoading(true)

        if (!userId) {
            alert('Please login to favorite hyms')
            setLoading(false)
            return
        }

        if (isFavorited) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('hymn_id', hymnId)

            if (!error) setIsFavorited(false)
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert({ user_id: userId, hymn_id: hymnId })

            if (!error) setIsFavorited(true)
        }
        setLoading(false)
    }

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={cn(
                "p-2 rounded-full transition-all duration-300 transform active:scale-95 hover:scale-110",
                isFavorited
                    ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                    : "text-gray-400 hover:text-red-400 hover:bg-white/10"
            )}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart
                className={cn("w-5 h-5", isFavorited && "fill-current")}
            />
        </button>
    )
}
