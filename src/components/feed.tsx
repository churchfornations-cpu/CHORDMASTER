import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { FeedRenderer } from './feed-renderer'
import { Hymn } from '@/lib/types'

export default async function Feed({ query }: { query?: string }) {
    const supabase = await createClient()

    let dbQuery = supabase
        .from('hymns')
        .select('*')
        .order('created_at', { ascending: false })

    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`)
    }

    const { data: hymns } = await dbQuery

    if (!hymns || hymns.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                    <Image src="/file.svg" width={40} height={40} alt="Empty" className="opacity-50" />
                </div>
                <p className="text-xl text-gray-400 font-medium">{query ? `No results for "${query}"` : "No chords found yet."}</p>
                <p className="text-sm text-gray-600 mt-2">{query ? "Try a different search term." : "Upload the first hymn to get started!"}</p>
            </div>
        )
    }

    return <FeedRenderer hymns={hymns as Hymn[]} />
}
