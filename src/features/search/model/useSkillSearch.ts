import { useMemo, useState } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'

/**
 * Поиск по названиям карточек.
 * Если передать externalQuery, строка поиска управляется снаружи (например, из Header),
 * иначе используется внутреннее состояние.
 */
export function useSkillSearch<T extends { title: string }>(
  skills: readonly T[],
  externalQuery?: string,
) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = externalQuery ?? internalQuery
  const debouncedQuery = useDebounce(query)
  const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase('ru-RU')
  const filteredSkills = useMemo(
    () =>
      skills.filter((skill) => skill.title.toLocaleLowerCase('ru-RU').includes(normalizedQuery)),
    [skills, normalizedQuery],
  )

  return { query, setQuery: setInternalQuery, filteredSkills, count: filteredSkills.length }
}
