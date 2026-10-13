import type { GenderValue } from '@/shared/ui/FilterPanel/GenderFilter'
import type { FiltersValue, SkillDirection } from './FiltersPanel'

export interface FilterableCatalogItem {
  direction: Exclude<SkillDirection, 'all'>
  skillIds: string[]
  gender: Exclude<GenderValue, 'any'>
  cityId: string
}

/**
 * карточка должна соответствовать каждой активной группе фильтров:
 * направлению И навыкам И полу И городу.
 * пустая группа не ограничивает результат.
 */
export function matchesFilters(
  item: FilterableCatalogItem,
  filters: FiltersValue,
): boolean {
  const matchesDirection =
    filters.direction === 'all' || item.direction === filters.direction
  const matchesSkills =
    filters.skillIds.length === 0 ||
    filters.skillIds.some((skillId) => item.skillIds.includes(skillId))
  const matchesGender = filters.gender === 'any' || item.gender === filters.gender
  const matchesCity =
    filters.cityIds.length === 0 || filters.cityIds.includes(item.cityId)

  return [matchesDirection, matchesSkills, matchesGender, matchesCity].every(Boolean)
}
