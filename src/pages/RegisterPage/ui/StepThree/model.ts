export interface StepThreeValue {
  title: string
  offer: {
    categoryId: string
    subcategoryId: string
  }
  description: string
  images: File[]
}

export const initialStepThreeValue: StepThreeValue = {
  title: '',
  offer: {
    categoryId: '',
    subcategoryId: '',
  },
  description: '',
  images: [],
}
