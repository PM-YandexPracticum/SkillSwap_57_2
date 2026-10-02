import { useId } from 'react'
import styles from './RadioGroup.module.css'

export interface RadioOption<T extends string> {
  label: string
  value: T
}

interface RadioGroupProps<T extends string> {
  name: string
  options: RadioOption<T>[]
  value: T
  onChange: (value: T) => void
}

export const RadioGroup = <T extends string>({
  name,
  options,
  value,
  onChange,
}: RadioGroupProps<T>) => {
  // useId нужен только для уникальных id input/label внутри одной группы
  const groupId = useId()

  return (
    <div className={styles.group}>
      {options.map((option) => {
        const isChecked = value === option.value
        const optionId = `${groupId}-${option.value}`

        return (
          <label key={option.value} htmlFor={optionId} className={styles.radioLabel}>
            <input
              id={optionId}
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={() => onChange(option.value)}
              className={styles.hiddenInput}
            />
            <div
              className={`${styles.customRadio} ${isChecked ? styles.checked : ''}`}
              aria-hidden="true"
            />
            <span className={styles.labelText}>{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}
