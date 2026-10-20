import type { StepThreeValue } from './model'
import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/ui/Button'
import { SkillForm } from '@/shared/ui/Form/SkillForm'
import { ImageUpload } from '@/shared/ui/ImageUpload'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import styles from './StepThree.module.css'

export interface StepThreeProps {
  value: StepThreeValue
  onChange: (value: StepThreeValue) => void
  onBack: () => void
  onContinue: (value: StepThreeValue) => void
}

type StepThreeErrors = Partial<
  Record<'title' | 'categoryIds' | 'skillIds' | 'description' | 'images', string>
>

export function StepThree({ value, onChange, onBack, onContinue }: StepThreeProps) {
  const [errors, setErrors] = useState<StepThreeErrors>({})

  const { title, offer, description, images } = value

  const update = (patch: Partial<StepThreeValue>) => {
    onChange({ ...value, ...patch })
  }

  const validate = (): StepThreeErrors => {
    const nextErrors: StepThreeErrors = {}

    if (!title.trim()) nextErrors.title = 'Введите название навыка'
    if (!offer.categoryId) nextErrors.categoryIds = 'Выберите категорию навыка'
    if (!offer.subcategoryId) nextErrors.skillIds = 'Выберите подкатегорию навыка'
    if (!description.trim()) nextErrors.description = 'Добавьте описание предложения'
    if (images.length === 0) nextErrors.images = 'Добавьте хотя бы одно изображение'

    return nextErrors
  }

  const handleSkillChange = (offer: StepThreeValue['offer']) => {
    update({ offer })

    setErrors((current) => ({
      ...current,
      categoryIds: undefined,
      skillIds: undefined,
    }))
  }

  const handleImagesChange = (images: File[]) => {
    update({ images })

    setErrors((current) => ({
      ...current,
      images: undefined,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const category = skills.find((item) => item.id === offer.categoryId)
    const hasCategory = Boolean(category)
    const hasSubcategory = category?.skills.some((item) => item.id === offer.subcategoryId)

    if (!hasCategory || !hasSubcategory) {
      setErrors({
        ...nextErrors,
        categoryIds: !hasCategory ? 'Выберите категорию навыка' : undefined,
        skillIds: !hasSubcategory ? 'Выберите подкатегорию навыка' : undefined,
      })
      return
    }

    onContinue({
      ...value,
      title: title.trim(),
      description: description.trim(),
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Название навыка"
        placeholder="Введите название вашего навыка"
        value={title}
        error={errors.title}
        onChange={(event) => {
          update({ title: event.target.value })
          setErrors((current) => ({ ...current, title: undefined }))
        }}
      />

      <div className={styles.skillFields}>
        <SkillForm
          value={{
            categoryIds: [offer.categoryId].filter(Boolean),
            subcategoryIds: [offer.subcategoryId].filter(Boolean),
          }}
          onChange={(value) => {
            handleSkillChange({
              categoryId: value.categoryIds[0],
              subcategoryId: value.subcategoryIds[0],
            })
          }}
        />
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
            update({ description: event.target.value })
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
        <Button type="button" variant="secondary" onClick={onBack}>
          Назад
        </Button>
        <Button type="submit">Продолжить</Button>
      </div>
    </form>
  )
}
