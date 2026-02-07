'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Library, PlusCircle, LogOut, Settings, Heart, MessageSquarePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { RequestHymnModal } from '@/components/request-hymn-modal'

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()
                    setRole(data?.role || 'user')
                }
            } catch (error) {
                console.error('Error fetching role:', error)
            } finally {
                setLoading(false)
            }
        }
        getUser()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Favorites', href: '/favorites', icon: Heart },
        { name: 'My Lists', href: '/library', icon: Library },
    ]

    // Only show Upload and Admin buttons to appropriate roles
    if (role === 'admin' || role === 'super_admin') {
        // Insert Upload after Favorites (index 2)
        navItems.splice(2, 0, { name: 'Upload', href: '/upload', icon: PlusCircle })
    }

    if (role === 'super_admin') {
        navItems.push({ name: 'Admin', href: '/admin', icon: Settings })
    }

    // Hide navbar on login page
    if (pathname === '/login') return null

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-lg md:hidden">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1",
                                    isActive ? "text-[#00FF00]" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        )
                    })}

                    {/* Mobile Request Button - Visible to all authenticated users */}
                    <RequestHymnModal trigger={
                        <div className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-[#FF5500] cursor-pointer">
                            <MessageSquarePlus className="w-5 h-5" />
                            <span className="text-[10px] font-medium">Request</span>
                        </div>
                    } />

                    <button
                        onClick={handleSignOut}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-white"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Desktop Top Navigation */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg px-6 h-16 items-center justify-between">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-[#FF5500] to-[#FF9900] bg-clip-text text-transparent">
                    CHORD MASTER
                </Link>

                <div className="flex items-center space-x-6">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-2 transition-colors hover:bg-white/5 px-3 py-2 rounded-lg",
                                    isActive ? "text-[#00FF00]" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        )
                    })}

                    {/* Desktop Request Button */}
                    <RequestHymnModal trigger={
                        <button className="flex items-center space-x-2 text-gray-400 hover:text-[#FF5500] hover:bg-white/5 px-3 py-2 rounded-lg transition-colors">
                            <MessageSquarePlus className="w-4 h-4" />
                            <span className="font-medium text-sm">Request</span>
                        </button>
                    } />

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors pl-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Spacers for content */}
            <div className="h-16 hidden md:block" />
            <div className="h-16 md:hidden" />
        </>
    )
}
