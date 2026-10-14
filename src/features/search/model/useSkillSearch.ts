import { useMemo, useState } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'

export function useSkillSearch<T extends { title: string }>(skills: readonly T[]) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query)
  const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase('ru-RU')
  const filteredSkills = useMemo(
    () =>
      skills.filter((skill) => skill.title.toLocaleLowerCase('ru-RU').includes(normalizedQuery)),
    [skills, normalizedQuery],
  )

  return { query, setQuery, filteredSkills, count: filteredSkills.length }
}
