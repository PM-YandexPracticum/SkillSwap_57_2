import { useEffect, useMemo, useState } from 'react'
import { Checkbox } from '@/shared/ui/checkbox/Checkbox'
import { OpenFilterButton } from '@/shared/ui/FilterPanel/OpenFilterButton'
import { Title } from '@/shared/ui/Title'
import styles from './CityFilter.module.css'

interface City {
  id: string
  title: string
}

export interface CityFilterProps {
  defaultSelectedCityIds?: string[]
  selectedCityIds?: string[]
  onChange?: (selectedCityIds: string[], selectedCount: number) => void
}

const COLLAPSED_CITY_COUNT = 5

export function CityFilter({
  defaultSelectedCityIds = [],
  selectedCityIds: controlledCityIds,
  onChange,
}: CityFilterProps) {
  const [cities, setCities] = useState<City[]>([])
  const [localCityIds, setLocalCityIds] = useState(
    () => new Set(defaultSelectedCityIds),
  )
  const selectedCityIds = controlledCityIds ? new Set(controlledCityIds) : localCityIds
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadCities() {
      try {
        const response = await fetch('/db/cities.json', {
          signal: abortController.signal,
        })

        if (!response.ok) throw new Error('Не удалось загрузить города')

        const loadedCities = (await response.json()) as City[]
        setCities(loadedCities)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setHasError(true)
      } finally {
        if (!abortController.signal.aborted) setIsLoading(false)
      }
    }

    loadCities()

    return () => abortController.abort()
  }, [])

  const visibleCities = useMemo(
    () => (isExpanded ? cities : cities.slice(0, COLLAPSED_CITY_COUNT)),
    [cities, isExpanded],
  )

  const toggleCity = (cityId: string) => {
    const nextSelectedIds = new Set(selectedCityIds)
    if (nextSelectedIds.has(cityId)) nextSelectedIds.delete(cityId)
    else nextSelectedIds.add(cityId)
    if (!controlledCityIds) setLocalCityIds(nextSelectedIds)
    onChange?.([...nextSelectedIds], nextSelectedIds.size)
  }

  return (
    <section className={styles.filter} aria-labelledby="city-filter-title">
      <div className={styles.heading}>
        <Title id="city-filter-title" size="H2">
          Город
        </Title>
      </div>

      {isLoading && <p className={styles.message}>Загрузка городов...</p>}
      {hasError && <p className={styles.error}>Не удалось загрузить города</p>}

      {!isLoading && !hasError && (
        <div className={styles.content}>
          <div className={styles.list}>
            {visibleCities.map((city) => (
              <div key={city.id} onClick={() => toggleCity(city.id)}>
                <Checkbox
                  state={selectedCityIds.has(city.id) ? 'checked' : 'default'}
                  text={city.title}
                  mode="check"
                />
              </div>
            ))}
          </div>

          {cities.length > COLLAPSED_CITY_COUNT && (
            <OpenFilterButton
              isOpen={isExpanded}
              onClick={() => setIsExpanded((currentValue) => !currentValue)}
            >
              Все города
            </OpenFilterButton>
          )}
        </div>
      )}
    </section>
  )
}
