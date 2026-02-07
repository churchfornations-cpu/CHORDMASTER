'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface UploadItem {
    id: string
    file: File
    title: string
    status: 'pending' | 'uploading' | 'success' | 'error'
}

export default function UploadPage() {
    const [items, setItems] = useState<UploadItem[]>([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
                router.push('/')
            }
        }
        checkRole()
    }, [router, supabase])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files))
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files.length > 0) {
            addFiles(Array.from(e.target.files))
        }
    }

    const addFiles = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'))

        const newItems: UploadItem[] = imageFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "), // Remove extension and replace separators
            status: 'pending'
        }))

        setItems(prev => [...prev, ...newItems])
    }

    const updateTitle = (id: string, newTitle: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, title: newTitle } : item
        ))
    }

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    const handleUpload = async () => {
        if (items.length === 0) return

        // Verify all have titles
        const missingTitles = items.filter(item => !item.title.trim())
        if (missingTitles.length > 0) {
            alert('Please ensure all hymns have a title.')
            return
        }

        setUploading(true)
        setProgress(0)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert("Please login to upload")
                setUploading(false)
                return
            }

            let completedCount = 0
            const totalItems = items.length

            // Process uploads sequnetially or in parallel, but track status for each
            const uploadPromises = items.map(async (item) => {
                if (item.status === 'success') return // Skip already uploaded if forcing retry? (not needed here)

                try {
                    // Update status to uploading
                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i))

                    const fileExt = item.file.name.split('.').pop()
                    const fileName = `${Math.random()}.${fileExt}`
                    const filePath = `${user.id}/${fileName}`

                    // Upload Image
                    const { error: uploadError } = await supabase.storage
                        .from('chord-images')
                        .upload(filePath, item.file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('chord-images')
                        .getPublicUrl(filePath)

                    // Insert DB Record
                    const { error: dbError } = await supabase
                        .from('hymns')
                        .insert({
                            title: item.title.trim(),
                            image_url: publicUrl,
                            user_id: user.id
                        })

                    if (dbError) throw dbError

                    // Update item status
                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success' } : i))

                    completedCount++
                    setProgress(Math.round((completedCount / totalItems) * 100))

                } catch (error) {
                    console.error('Error uploading item:', item.title, error)
                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i))
                }
            })

            await Promise.all(uploadPromises)

            // Check if any failed
            const failed = items.filter(i => i.status === 'error')

            // Small delay to show 100%
            await new Promise(resolve => setTimeout(resolve, 500))

            if (failed.length === 0) {
                // All success
                router.push('/')
                router.refresh()
            } else {
                alert(`Upload complete with ${failed.length} errors. Please retry failed items.`)
                // Keep failed items in list, remove success? Or just show states.
                // For now, let's just stop loading. User can see error icons.
            }

        } catch (error) {
            console.error(error)
            alert('Global error uploading files')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF5500] to-[#FF9900] bg-clip-text text-transparent mb-8">
                Bulk Upload Hymns
            </h1>

            {/* Neon Progress Overlay */}
            {uploading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md px-8 text-center">
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00FF00] to-[#00CC00] mb-8 animate-pulse uppercase tracking-widest">
                            Uploading...
                        </h2>

                        <div className="relative w-full h-8 bg-gray-900 rounded-full overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <div
                                className="h-full bg-gradient-to-r from-[#00FF00] via-[#55FF55] to-[#00FF00] transition-all duration-300 ease-out shadow-[0_0_25px_#00FF00] relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-[shimmer_1s_infinite]"></div>
                            </div>
                        </div>

                        <p className="mt-4 text-[#00FF00] font-mono text-xl">{progress}%</p>
                    </div>
                </div>
            )}

            <div className="bg-[#171717]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="space-y-6">

                    {/* File Drop Zone */}
                    <div
                        className={cn(
                            "relative border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer group",
                            dragActive ? "border-[#00FF00] bg-[#00FF00]/5" : "border-white/10 hover:border-white/20 bg-black/20"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleChange}
                        />
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-lg font-medium text-white mb-2">Drop chord images here</p>
                        <p className="text-sm text-gray-500">or click to browse multiple files</p>
                    </div>

                    {/* Upload List */}
                    {items.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h3 className="text-lg font-semibold text-white">Selected Files ({items.length})</h3>
                                <button
                                    onClick={() => setItems([])}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="relative flex gap-4 bg-zinc-900/50 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group">
                                        {/* Thumbnail */}
                                        <div className="relative w-24 h-32 flex-shrink-0 bg-zinc-800 rounded-lg overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(item.file)}
                                                alt="Preview"
                                                className="object-cover w-full h-full"
                                            />
                                            {item.status === 'success' && (
                                                <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center backdrop-blur-[2px]">
                                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                            {item.status === 'error' && (
                                                <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center backdrop-blur-[2px]">
                                                    <AlertCircle className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info & Inputs */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-xs text-gray-500 truncate max-w-[150px]" title={item.file.name}>
                                                        {item.file.name}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                                        className="text-gray-500 hover:text-red-500 transition-colors -mt-1 -mr-1 p-1"
                                                        title="Remove"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        value={item.title}
                                                        onChange={(e) => updateTitle(item.id, e.target.value)}
                                                        placeholder="Hymn Title"
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF5500] transition-colors placeholder:text-gray-600"
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={uploading || items.length === 0}
                                className={cn(
                                    "w-full py-4 rounded-xl font-bold text-black uppercase tracking-wide transition-all mt-4",
                                    uploading || items.length === 0
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-[#00FF00] hover:bg-[#00CC00] hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                                )}
                            >
                                {uploading ? `Processing ${items.length} files...` : `Upload ${items.length} Hymns`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
