import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items?.map((item: any) => (
                    item.hymn && (
                        <div key={item.id} className="group relative break-inside-avoid rounded-xl border border-white/10 bg-[#171717] overflow-hidden hover:border-[#FF5500] transition-all hover:shadow-[0_0_30px_rgba(255,85,0,0.15)]">
                            <Link href={`/hymn/${item.hymn.id}`} className="block relative aspect-[3/4] w-full overflow-hidden">
                                <img
                                    src={item.hymn.image_url}
                                    alt={item.hymn.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <h3 className="text-lg font-bold text-white line-clamp-2">{item.hymn.title}</h3>
                                    <p className="text-xs text-[#00FF00] font-medium mt-1">View Chord Sheet</p>
                                </div>
                            </Link>
                            <div className="p-3 md:hidden">
                                <h3 className="text-sm font-bold text-white truncate">{item.hymn.title}</h3>
                            </div>
                        </div>
                    )
                ))}

                {(!items || items.length === 0) && (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                            <Image src="/file.svg" width={40} height={40} alt="Empty" className="opacity-50" />
                        </div>
                        <p className="text-xl text-gray-400 font-medium">This list is empty.</p>
                        <p className="text-sm text-gray-600 mt-2">Go to the Home Feed to add hymns.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
