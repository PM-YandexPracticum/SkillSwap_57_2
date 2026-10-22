import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSkillSearch } from './useSkillSearch'

const skills = [
  { id: '1', title: 'Игра на барабанах', description: 'Подарок другу' },
  { id: '2', title: 'Управление командой', description: '' },
  { id: '3', title: 'Французский язык', description: '' },
]

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('useSkillSearch', () => {
  it('debounces search and ignores case and surrounding spaces', () => {
    const { result } = renderHook(() => useSkillSearch(skills))
    act(() => result.current.setQuery('  БАРАБАН  '))
    act(() => vi.advanceTimersByTime(299))
    expect(result.current.count).toBe(3)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.filteredSkills).toEqual([skills[0]])
    expect(result.current.count).toBe(1)
  })

  it('waits for the latest query when typing quickly', () => {
    const { result } = renderHook(() => useSkillSearch(skills))
    act(() => result.current.setQuery('Игра'))
    act(() => vi.advanceTimersByTime(200))
    act(() => result.current.setQuery('язык'))
    act(() => vi.advanceTimersByTime(299))
    expect(result.current.count).toBe(3)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.filteredSkills).toEqual([skills[2]])
  })

  it('searches only titles and restores all results for an empty query', () => {
    const { result } = renderHook(() => useSkillSearch(skills))
    act(() => result.current.setQuery('Подарок'))
    act(() => vi.advanceTimersByTime(300))
    expect(result.current.count).toBe(0)
    act(() => result.current.setQuery('   '))
    expect(result.current.filteredSkills).toEqual(skills)
  })

  it('updates results when the shared data changes', () => {
    const { result, rerender } = renderHook(({ items }) => useSkillSearch(items), {
      initialProps: { items: skills },
    })
    act(() => result.current.setQuery('язык'))
    act(() => vi.advanceTimersByTime(300))
    const addedSkill = { id: '4', title: 'Английский язык', description: '' }
    rerender({ items: [...skills, addedSkill] })
    expect(result.current.filteredSkills).toEqual([skills[2], addedSkill])
    expect(result.current.count).toBe(2)
  })
})
