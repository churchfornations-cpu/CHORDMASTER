import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Feed from '@/components/feed'
import { SearchInput } from '@/components/search-input'
import { RequestHymnModal } from '@/components/request-hymn-modal'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role, full_name, email').eq('id', user.id).single()
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'User'

  const query = (await searchParams).q

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Message */}
      <div className="mb-6 text-xl md:text-2xl font-light text-gray-300">
        Welcome, <span className="font-semibold text-[#00FF00]">{userName}</span>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Latest Hymns</h1>
          {/* Conditional Admin Button */}
          {profile?.role === 'super_admin' && (
            <a href="/admin" className="px-4 py-2 text-sm font-medium text-black bg-[#00FF00] rounded-full hover:bg-[#00CC00] transition-colors shadow-[0_0_15px_rgba(0,255,0,0.3)]">
              Admin Dashboard
            </a>
          )}
        </div>

        <SearchInput />
      </div>

      <Feed query={query} userId={user.id} />
    </div>
  )
}
