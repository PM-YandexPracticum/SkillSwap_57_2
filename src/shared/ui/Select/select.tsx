import { useId, useState } from 'react'
import type { FocusEvent, KeyboardEvent } from 'react'
import arrowIcon from '@/shared/assets/images/chevron-down.svg'
import './select.css'

export interface SelectOption {
  value: string
  label: string
}

export type SelectValue = string | string[]

export interface SelectProps {
  label: string
  options: readonly SelectOption[]
  placeholder: string
  multiple?: boolean
  error?: string
  width?: number | string
  value?: SelectValue
  onChange?: (value: SelectValue) => void
  disabled?: boolean
}

export function Select({
  label,
  options,
  placeholder,
  multiple = false,
  error,
  width = '100%',
  value,
  onChange,
  disabled = false,
}: SelectProps) {
  const id = useId()
  const [localValue, setLocalValue] = useState<SelectValue>(multiple ? [] : '')
  const [isOpen, setIsOpen] = useState(false)
  const values = value ?? localValue
  const selected = Array.isArray(values) ? values : values ? [values] : []
  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((o) => o.label)

  const change = (next: SelectValue) => {
    if (value === undefined) setLocalValue(next)
    onChange?.(next)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') setIsOpen(false)
  }

  return (
    <div className="select-wrapper" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <label className="selectlabel" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        className="select"
        style={{ width }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={selectedLabels.length ? '' : 'selectplaceholder'}>
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <img
          className={isOpen ? 'selectarrow selectarrow-open' : 'selectarrow'}
          src={arrowIcon}
          alt=""
        />
      </button>
      {isOpen && (
        <ul
          id={`${id}-options`}
          className="select-options"
          role="listbox"
          aria-multiselectable={multiple}
        >
          {options.map((option) => {
            const isSelected = selected.includes(option.value)
            const next = isSelected
              ? selected.filter((item) => item !== option.value)
              : [...selected, option.value]
            return (
              <li key={option.value}>
                <button
                  type="button"
                  className="select-option"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    change(multiple ? next : option.value)
                    if (!multiple) setIsOpen(false)
                  }}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  )}
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {error && <span className="selecterror">{error}</span>}
    </div>
  )
}
