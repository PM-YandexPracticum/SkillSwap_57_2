import type { City } from '@/shared/types'
import type { SkillFormValue } from '@/shared/ui/Form/SkillForm'

export interface StepTwoValue {
  avatar: File | null
  name: string
  birthDate: Date | null
  gender: 'unspecified' | 'male' | 'female'
  city: City | null
  learningSkills: SkillFormValue
}

export const initialStepTwoValue: StepTwoValue = {
  avatar: null,
  name: '',
  birthDate: null,
  gender: 'unspecified',
  city: null,
  learningSkills: { categoryIds: [], skillIds: [] },
}
