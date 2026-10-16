import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/ui/Button'
import { AuthInfoCard } from '@/shared/ui/Form/AuthInfoCard'
import { SkillForm, type SkillFormValue } from '@/shared/ui/Form/SkillForm'
import { Steps } from '@/shared/ui/Form/Steps'
import { ImageUpload } from '@/shared/ui/ImageUpload'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import presentationIllustration from '@/shared/assets/images/auth-presentation.svg'
import styles from './StepThree.module.css'

export interface StepThreeValue {
  title: string
  category: string
  subcategory: string
  description: string
  images: File[]
}

export interface StepThreeProps {
  initialValue?: Partial<StepThreeValue>
  onBack: () => void
  onContinue: (value: StepThreeValue) => void
}

type StepThreeErrors = Partial<Record<'title' | 'categoryIds' | 'skillIds' | 'description' | 'images', string>>

const EMPTY_SKILL: SkillFormValue = { categoryIds: [], skillIds: [] }

const getInitialSkill = (value?: Partial<StepThreeValue>): SkillFormValue => {
  if (!value?.category && !value?.subcategory) return EMPTY_SKILL

  const category = skills.find((item) => item.title === value.category)
  const subcategory = category?.skills.find((item) => item.title === value.subcategory)

  return {
    categoryIds: category ? [category.id] : [],
    skillIds: subcategory ? [subcategory.id] : [],
  }
}

export function StepThree({ initialValue, onBack, onContinue }: StepThreeProps) {
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [skill, setSkill] = useState<SkillFormValue>(() => getInitialSkill(initialValue))
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [images, setImages] = useState<File[]>(initialValue?.images ?? [])
  const [errors, setErrors] = useState<StepThreeErrors>({})

  const validate = (): StepThreeErrors => {
    const nextErrors: StepThreeErrors = {}

    if (!title.trim()) nextErrors.title = 'Введите название навыка'
    if (skill.categoryIds.length === 0) nextErrors.categoryIds = 'Выберите категорию навыка'
    if (skill.skillIds.length === 0) nextErrors.skillIds = 'Выберите подкатегорию навыка'
    if (!description.trim()) nextErrors.description = 'Добавьте описание предложения'
    if (images.length === 0) nextErrors.images = 'Добавьте хотя бы одно изображение'

    return nextErrors
  }

  const handleSkillChange = (value: SkillFormValue) => {
    setSkill(value)
    setErrors((current) => ({ ...current, categoryIds: undefined, skillIds: undefined }))
  }

  const handleImagesChange = (value: File[]) => {
    setImages(value)
    setErrors((current) => ({ ...current, images: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const category = skills.find((item) => item.id === skill.categoryIds[0])
    const subcategory = category?.skills.find((item) => item.id === skill.skillIds[0])

    if (!category || !subcategory) return

    onContinue({
      title: title.trim(),
      category: category.title,
      subcategory: subcategory.title,
      description: description.trim(),
      images,
    })
  }

  return (
    <section className={styles.step} aria-labelledby="step-three-title">
      <h1 id="step-three-title" className={styles.visuallyHidden}>Третий шаг регистрации</h1>
      <Steps currentStep={3} />

      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="Название навыка"
            placeholder="Введите название вашего навыка"
            value={title}
            error={errors.title}
            onChange={(event) => {
              setTitle(event.target.value)
              setErrors((current) => ({ ...current, title: undefined }))
            }}
          />

          <div className={styles.skillFields}>
            <SkillForm value={skill} onChange={handleSkillChange} />
            {errors.categoryIds && (
              <p className={styles.error} role="alert">
                {errors.categoryIds}
              </p>
            )}
            {errors.skillIds && (
              <p className={styles.error} role="alert">
                {errors.skillIds}
              </p>
            )}
          </div>

          <div>
            <Textarea
              label="Описание"
              placeholder="Коротко опишите, чему можете научить"
              value={description}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'step-three-description-error' : undefined}
              onChange={(event) => {
                setDescription(event.target.value)
                setErrors((current) => ({ ...current, description: undefined }))
              }}
            />
            {errors.description && (
              <p id="step-three-description-error" className={styles.error} role="alert">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <ImageUpload variant="skill" value={images} onChange={handleImagesChange} />
            {errors.images && (
              <p className={styles.error} role="alert">
                {errors.images}
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={onBack}>Назад</Button>
            <Button type="submit">Продолжить</Button>
          </div>
        </form>

        <AuthInfoCard
          illustration={presentationIllustration}
          title="Укажите, чем вы готовы поделиться"
          description="Так другие люди смогут увидеть ваши предложения и предложить вам обмен!"
        />
      </div>
    </section>
  )
}
