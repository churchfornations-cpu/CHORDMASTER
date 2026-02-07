'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'super_admin') {
                router.push('/')
                return
            }

            fetchUsers()
        }
        checkAuth()
    }, [router, supabase])

    const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        if (data) setUsers(data as Profile[])
        setLoading(false)
    }

    const updateRole = async (userId: string, newRole: 'user' | 'admin') => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            console.error('Error updating role:', error)
            fetchUsers()
            alert('Failed to update role. Ensure you have permissions.')
        }
    }

    const totalUsers = users.length
    const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
    const totalRegularUsers = users.filter(u => u.role === 'user').length

    if (loading) return <div className="p-8 text-white flex justify-center">Loading...</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF5500] to-[#FF9900] bg-clip-text text-transparent mb-8">
                Admin Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-gray-400 font-medium mb-2">Total Users</h3>
                    <p className="text-4xl font-bold text-white">{totalUsers}</p>
                </div>
                <div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-gray-400 font-medium mb-2">Admins</h3>
                    <p className="text-4xl font-bold text-[#00FF00]">{totalAdmins}</p>
                </div>
                <div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-gray-400 font-medium mb-2">Regular Users</h3>
                    <p className="text-4xl font-bold text-gray-400">{totalRegularUsers}</p>
                </div>
            </div>

            <div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-x-auto shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="pb-4 text-gray-400 font-medium px-4">User</th>
                            <th className="pb-4 text-gray-400 font-medium px-4">Role</th>
                            <th className="pb-4 text-gray-400 font-medium px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5500] to-[#FF9900] flex items-center justify-center text-sm font-bold shadow-lg">
                                            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.full_name || 'No Name'}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium border",
                                        user.role === 'super_admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                            user.role === 'admin' ? "bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/20" :
                                                "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                    )}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    {user.role !== 'super_admin' && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user.role === 'user' ? (
                                                <button
                                                    onClick={() => updateRole(user.id, 'admin')}
                                                    className="text-xs bg-[#00FF00]/10 hover:bg-[#00FF00]/20 text-[#00FF00] px-3 py-1.5 rounded-lg border border-[#00FF00]/20 transition-all hover:scale-105"
                                                >
                                                    Promote to Admin
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => updateRole(user.id, 'user')}
                                                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all hover:scale-105"
                                                >
                                                    Demote to User
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
