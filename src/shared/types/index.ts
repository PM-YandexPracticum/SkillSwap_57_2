// ─── Skill ───────────────────────────────────────────────
export interface Skill {
  id: string
  title: string
  category: string
  subcategory: string
  description: string
  images: string[]
}

// ─── User ────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  aboutMe: string
  gender: 'male' | 'female'
  city: string
  birthDate: string
  createdAt: string
  likesCount: number
  teach: string[]
  learn: string[]
  likesCard: string[]
}

// ─── City ────────────────────────────────────────────────
export interface City {
  id: string
  title: string
}

// ─── Request ─────────────────────────────────────────────
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'inProgress' | 'done'

export interface SwapRequest {
  id: string
  skillId: string
  fromUserId: string
  toUserId: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
}

// ─── Auth ────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  token: string
}
