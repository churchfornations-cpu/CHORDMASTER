import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedRenderer } from '@/components/feed-renderer'
import { Hymn } from '@/lib/types'
import Image from 'next/image'

export default async function FavoritesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch favorited hymns
    // We use !inner to perform an inner join, filtering hymns that have a favorite entry for this user
    const { data: hymns } = await supabase
        .from('hymns')
        .select(`
            *,
            favorites!inner(*)
        `)
        .eq('favorites.user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-8">
                My Favorites
            </h1>

            {(!hymns || hymns.length === 0) ? (
                <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5">
                    <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                        <Image src="/file.svg" width={40} height={40} alt="Empty" className="opacity-50" />
                    </div>
                    <p className="text-xl text-gray-400 font-medium">No favorites yet.</p>
                    <p className="text-sm text-gray-600 mt-2">Click the heart icon on any hymn to add it here.</p>
                </div>
            ) : (
                <FeedRenderer hymns={hymns as unknown as Hymn[]} userId={user.id} />
            )}
        </div>
    )
}
