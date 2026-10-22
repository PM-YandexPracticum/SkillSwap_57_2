import type { City } from '@/shared/types'
import { GENDER_OPTIONS } from '@/shared/ui/FilterPanel/GenderFilter'
import { DIRECTION_OPTIONS, type FiltersValue } from '@/shared/ui/FiltersPanel'
import { skills as skillCategories } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'

export type ActiveFilter = {
  kind: 'direction' | 'skill' | 'gender' | 'city'
  value: string
  label: string
}

export const hasActiveFilters = (filters: FiltersValue): boolean =>
  filters.direction !== 'all' ||
  filters.skillIds.length > 0 ||
  filters.gender !== 'any' ||
  filters.cityIds.length > 0

/** Подписи берём из тех же справочников и вариантов, что видит пользователь в панели. */
export function getActiveFilters(filters: FiltersValue, cities: City[]): ActiveFilter[] {
  const chips: ActiveFilter[] = []
  const direction = DIRECTION_OPTIONS.find((option) => option.value === filters.direction)
  if (filters.direction !== 'all' && direction) {
    chips.push({ kind: 'direction', value: direction.value, label: direction.label })
  }
  for (const category of skillCategories) {
    for (const skill of category.skills) {
      if (filters.skillIds.includes(skill.id)) {
        chips.push({ kind: 'skill', value: skill.id, label: skill.title })
      }
    }
  }
  const gender = GENDER_OPTIONS.find((option) => option.value === filters.gender)
  if (filters.gender !== 'any' && gender) {
    chips.push({ kind: 'gender', value: gender.value, label: gender.label })
  }
  for (const city of cities) {
    if (filters.cityIds.includes(city.id)) {
      chips.push({ kind: 'city', value: city.id, label: city.title })
    }
  }
  return chips
}
