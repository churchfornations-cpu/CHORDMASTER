'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()

    // Auth State
    const [view, setView] = useState<'login' | 'signup'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    // Form Data
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.push('/')
            }
        }
        checkUser()
    }, [supabase, router])

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) setError(error.message)
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setIsLoading(true)

        try {
            if (view === 'signup') {
                if (!fullName.trim()) {
                    throw new Error('Please enter your full name')
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (error) throw error
                setMessage('Check your email for the confirmation link.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-black/40 p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#FF5500] to-[#FF9900] bg-clip-text text-transparent mb-2">
                        CHORD MASTER
                    </h1>
                    <p className="text-sm text-gray-400">
                        {view === 'login' ? 'Sign in to access the global worship library' : 'Create an account to join the community'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500 text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-500 text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {view === 'signup' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-[#FF5500] transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-[#FF5500] transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-[#FF5500] transition-colors" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF5500] transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold uppercase tracking-wide py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                {view === 'login' ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0a0a0a] px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </button>

                <div className="text-center text-sm text-gray-500">
                    {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                        className="font-semibold text-[#FF5500] hover:text-[#FF8800] transition-colors"
                    >
                        {view === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    )
}
