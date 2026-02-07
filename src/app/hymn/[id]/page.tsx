import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AddToListButton } from '@/components/add-to-list-button'
import { HymnViewer } from '@/components/hymn-viewer'
import { FavoriteButton } from '@/components/favorite-button'
import { HymnAdminControls } from '@/components/hymn-admin-controls'

export default async function HymnPage({
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const { data: hymn } = await supabase
        .from('hymns')
        .select('*')
        .eq('id', id)
        .single()

    if (!hymn) {
        return <div className="p-8 text-center text-gray-500">Hymn not found</div>
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-10 min-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    <span>Back</span>
                </Link>

                <div className="flex items-center gap-2">
                    <FavoriteButton hymnId={hymn.id} />
                    <AddToListButton hymnId={hymn.id} />
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">{hymn.title}</h1>

                {/* Admin Controls - visible only to super_admin (logic inside component) */}
                <HymnAdminControls
                    hymnId={hymn.id}
                    initialTitle={hymn.title}
                    role={profile?.role}
                />

                <HymnViewer imageUrl={hymn.image_url} title={hymn.title} />
            </div>
        </div>
    )
}
