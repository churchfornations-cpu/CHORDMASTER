'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function SearchInput() {
    const searchParams = useSearchParams()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        replace(`/?${params.toString()}`)
    }, 300)

    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="w-5 h-5" />
            </div>
            <input
                defaultValue={searchParams.get('q')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search hymns..."
                className="block w-full rounded-lg bg-zinc-900/50 border border-white/10 py-2.5 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
            />
        </div>
    )
}
