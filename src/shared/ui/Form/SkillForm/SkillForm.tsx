import { useState } from 'react'
import { Select } from '@/shared/ui/Select'
import type { SelectValue } from '@/shared/ui/Select'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import styles from './SkillForm.module.css'

export interface SkillFormValue {
  categoryIds: string[]
  subcategoryIds: string[]
}

export interface SkillFormProps {
  multiple?: boolean
  value?: SkillFormValue
  onChange?: (value: SkillFormValue) => void
  skillLabel?: string
  skillPlaceholder?: string
}

const EMPTY_VALUE: SkillFormValue = { categoryIds: [], subcategoryIds: [] }

const toStringArray = (value: SelectValue): string[] =>
  Array.isArray(value) ? value : value ? [value] : []

export const SkillForm = ({
  multiple,
  value,
  onChange,
  skillLabel = 'Навык, которому хотите научиться',
  skillPlaceholder = 'Выберите навык',
}: SkillFormProps) => {
  const [internalValue, setInternalValue] = useState<SkillFormValue>(value ?? EMPTY_VALUE)
  const selectedValue = value ?? internalValue

  const updateValue = (nextValue: SkillFormValue) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  const categoryOptions = skills
    .filter(
      (category) =>
        selectedValue.subcategoryIds.length === 0 ||
        selectedValue.categoryIds.includes(category.id) ||
        category.skills.some((skill) => selectedValue.subcategoryIds.includes(skill.id)),
    )
    .map((category) => ({ value: category.id, label: category.title }))

  const selectedCategories = skills.filter(
    (category) =>
      selectedValue.categoryIds.length === 0 || selectedValue.categoryIds.includes(category.id),
  )
  const skillOptions = selectedCategories.flatMap((category) =>
    category.skills.map((skill) => ({ value: skill.id, label: skill.title })),
  )

  const handleCategoriesChange = (nextValue: SelectValue) => {
    const categoryIds = toStringArray(nextValue)
    const availableSkillIds = new Set<string>(
      skills
        .filter((category) => categoryIds.includes(category.id))
        .flatMap((category) => category.skills.map((skill) => skill.id)),
    )

    updateValue({
      categoryIds,
      subcategoryIds: selectedValue.subcategoryIds.filter((skillId) =>
        availableSkillIds.has(skillId),
      ),
    })
  }

  const handleSkillsChange = (nextValue: SelectValue) => {
    const availableSkillIds = new Set<string>(skillOptions.map((option) => option.value))
    updateValue({
      categoryIds: selectedValue.categoryIds,
      subcategoryIds: toStringArray(nextValue).filter((skillId) => availableSkillIds.has(skillId)),
    })
  }

  return (
    <div className={styles.skillForm}>
      <Select
        label="Категория навыка, которому хотите научиться"
        options={categoryOptions}
        placeholder="Выберите категорию"
        multiple={multiple}
        value={selectedValue.categoryIds}
        onChange={handleCategoriesChange}
      />
      <Select
        label={skillLabel}
        options={skillOptions}
        placeholder={skillPlaceholder}
        multiple={multiple}
        value={selectedValue.subcategoryIds}
        onChange={handleSkillsChange}
      />
    </div>
  )
}
