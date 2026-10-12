import { useState } from 'react'
import { Select } from '@/shared/ui/Select'
import type { SelectValue } from '@/shared/ui/Select'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import styles from './SkillForm.module.css'

export interface SkillFormValue {
  categoryIds: string[]
  skillIds: string[]
}

export interface SkillFormProps {
  value?: SkillFormValue
  onChange?: (value: SkillFormValue) => void
}

const EMPTY_VALUE: SkillFormValue = { categoryIds: [], skillIds: [] }

const toStringArray = (value: SelectValue): string[] =>
  Array.isArray(value) ? value : value ? [value] : []

export const SkillForm = ({ value, onChange }: SkillFormProps) => {
  const [internalValue, setInternalValue] = useState<SkillFormValue>(value ?? EMPTY_VALUE)
  const selectedValue = value ?? internalValue

  const updateValue = (nextValue: SkillFormValue) => {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  const categoryOptions = skills
    .filter(
      (category) =>
        selectedValue.skillIds.length === 0 ||
        selectedValue.categoryIds.includes(category.id) ||
        category.skills.some((skill) => selectedValue.skillIds.includes(skill.id)),
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
      skillIds: selectedValue.skillIds.filter((skillId) => availableSkillIds.has(skillId)),
    })
  }

  const handleSkillsChange = (nextValue: SelectValue) => {
    const availableSkillIds = new Set<string>(skillOptions.map((option) => option.value))
    updateValue({
      categoryIds: selectedValue.categoryIds,
      skillIds: toStringArray(nextValue).filter((skillId) => availableSkillIds.has(skillId)),
    })
  }

  return (
    <div className={styles.skillForm}>
      <Select
        label="Категория навыка, которому хотите научиться"
        options={categoryOptions}
        placeholder="Выберите категорию"
        multiple
        value={selectedValue.categoryIds}
        onChange={handleCategoriesChange}
      />
      <Select
        label="Навык, которому хотите научиться"
        options={skillOptions}
        placeholder="Выберите навык"
        multiple
        value={selectedValue.skillIds}
        onChange={handleSkillsChange}
      />
    </div>
  )
}
