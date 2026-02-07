'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteHymn(id: string) {
    const supabase = await createClient()

    // RLS should handle permission check
    const { error } = await supabase
        .from('hymns')
        .delete()
        .eq('id', id)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/library')
    revalidatePath('/favorites')
}

export async function updateHymnTitle(id: string, title: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('hymns')
        .update({ title })
        .eq('id', id)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/library')
    revalidatePath('/favorites')
    revalidatePath(`/hymn/${id}`)
}
