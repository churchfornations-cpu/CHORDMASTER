import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { CreateListModal } from '@/components/create-list-modal'

export default async function LibraryPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user's lists
    const { data: lists } = await supabase
        .from('hymn_lists')
        .select('*')
        .eq('user_id', user.id)

    const listCount = lists?.length || 0

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">My Lists</h1>
                <CreateListModal currentCount={listCount} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists?.map((list) => (
                    <Link key={list.id} href={`/library/${list.id}`}>
                        <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 hover:border-[#FF5500] transition-colors cursor-pointer group h-full">
                            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF5500] transition-colors">{list.name}</h2>
                            <p className="text-gray-400 text-sm">View List</p>
                        </div>
                    </Link>
                ))}

                {(!lists || lists.length === 0) && (
                    <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                        <p>You haven't created any lists yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
