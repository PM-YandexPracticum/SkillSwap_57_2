import type { SkillFormValue } from '@/shared/ui/Form/SkillForm'

export interface StepThreeValue {
  title: string
  skill: SkillFormValue
  description: string
  images: File[]
}

export const initialStepThreeValue: StepThreeValue = {
  title: '',
  skill: {
    categoryIds: [],
    skillIds: [],
  },
  description: '',
  images: [],
}
