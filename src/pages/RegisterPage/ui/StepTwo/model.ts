import type { City } from '@/shared/types'

export interface StepTwoValue {
  avatar: File | null
  name: string
  birthDate: Date | null
  gender: 'unspecified' | 'male' | 'female'
  city: City | null
  likes: { categoryIds: string[]; subcategoryIds: string[] }
}

export const initialStepTwoValue: StepTwoValue = {
  avatar: null,
  name: '',
  birthDate: null,
  gender: 'unspecified',
  city: null,
  likes: { categoryIds: [], subcategoryIds: [] },
}
