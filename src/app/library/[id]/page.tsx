import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { FeedRenderer } from '@/components/feed-renderer'
import { Hymn } from '@/lib/types'

export default async function ListDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch list details
    const { data: list } = await supabase
        .from('hymn_lists')
        .select('*')
        .eq('id', id)
        .single()

    if (!list) {
        return <div className="p-8 text-center text-gray-500">List not found</div>
    }

    // Fetch items in list
    const { data: items } = await supabase
        .from('list_items')
        .select(`
      *,
      hymn:hymns (*)
    `)
        .eq('list_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/library" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
            </Link>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">{list.name}</h1>
                {/* Delete list button could go here */}
            </div>

            {items && items.length > 0 ? (
                <FeedRenderer hymns={items.map((item: any) => item.hymn).filter(Boolean) as Hymn[]} userId={user.id} />
            ) : (
                <div className="py-20 text-center">
                    <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                        <Image src="/file.svg" width={40} height={40} alt="Empty" className="opacity-50" />
                    </div>
                    <p className="text-xl text-gray-400 font-medium">This list is empty.</p>
                    <p className="text-sm text-gray-600 mt-2">Go to the Home Feed to add hymns.</p>
                </div>
            )}
        </div>
    )
}
