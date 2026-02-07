export type Profile = {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    updated_at: string | null
    role: 'user' | 'admin' | 'super_admin'
}

export type Hymn = {
    id: string
    title: string
    image_url: string
    user_id: string
    created_at: string
}

export type HymnList = {
    id: string
    name: string
    user_id: string
    created_at: string
}

export type ListItem = {
    id: string
    list_id: string
    hymn_id: string
    created_at: string
}
