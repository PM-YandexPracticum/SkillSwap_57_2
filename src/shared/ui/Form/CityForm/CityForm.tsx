import { useId, useRef, useState } from 'react'
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react'
import crossIcon from '@/shared/assets/images/cross.svg'
import { Input } from '@/shared/ui/Input'
import styles from './CityForm.module.css'

export interface City {
  id: string
  title: string
}

interface CityFormProps {
  cities: City[]
  value: City | null
  onChange: (city: City | null) => void
  label?: string
  placeholder?: string
}

const NOT_FOUND_TEXT = 'Город не найден'

export const CityForm = ({
  cities,
  value,
  onChange,
  label = 'Город',
  placeholder = 'Не указан',
}: CityFormProps) => {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const inputValue = query ?? value?.title ?? ''
  const normalizedQuery = (query ?? '').trim().toLocaleLowerCase('ru')
  const filteredCities = normalizedQuery
    ? cities.filter((city) => city.title.toLocaleLowerCase('ru').startsWith(normalizedQuery))
    : cities

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setIsOpen(true)
    if (value) onChange(null)
  }

  const handleSelect = (city: City) => {
    onChange(city)
    setQuery(null)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setIsOpen(true)
    inputRef.current?.focus()
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false)
      setQuery(null)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') setIsOpen(false)
  }

  return (
    <div className={styles.cityForm} onBlur={handleBlur}>
      <Input
        ref={inputRef}
        label={label}
        className={styles.field}
        value={inputValue}
        placeholder={placeholder}
        autoComplete='off'
        role='combobox'
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete='list'
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        endIcon={inputValue ? <img src={crossIcon} alt='' /> : undefined}
        onEndIconClick={handleClear}
      />
      {isOpen && (
        <ul id={listId} className={styles.list} role='listbox' onMouseDown={(event) => event.preventDefault()} >
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <li key={city.id} role='option' aria-selected={value?.id === city.id}>
                <button type='button' className={styles.option} onClick={() => handleSelect(city)}>
                  {city.title}
                </button>
              </li>
            ))
          ) : (
            <li className={styles.empty}>{NOT_FOUND_TEXT}</li>
          )}
        </ul>
      )}
    </div>
  )
}