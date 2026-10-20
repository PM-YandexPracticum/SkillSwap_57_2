import { describe, expect, it } from 'vitest'
import type { FiltersValue } from '@/shared/ui/FiltersPanel'
import { getActiveFilters, hasActiveFilters } from './activeFilters'

const defaults: FiltersValue = {
  direction: 'all',
  skillIds: [],
  gender: 'any',
  cityIds: [],
}

describe('active catalog filters', () => {
  it('does not create chips for default values', () => {
    expect(hasActiveFilters(defaults)).toBe(false)
    expect(getActiveFilters(defaults, [{ id: 'moscow', title: 'Москва' }])).toEqual([])
  })

  it('uses panel labels and city names instead of technical IDs', () => {
    const filters: FiltersValue = {
      direction: 'teach',
      skillIds: ['music', 'english'],
      gender: 'female',
      cityIds: ['kazan'],
    }
    expect(hasActiveFilters(filters)).toBe(true)
    expect(getActiveFilters(filters, [{ id: 'kazan', title: 'Казань' }])).toEqual([
      { kind: 'direction', value: 'teach', label: 'Могу научить' },
      { kind: 'skill', value: 'music', label: 'Музыка и звук' },
      { kind: 'skill', value: 'english', label: 'Английский' },
      { kind: 'gender', value: 'female', label: 'Женский' },
      { kind: 'city', value: 'kazan', label: 'Казань' },
    ])
  })
})
