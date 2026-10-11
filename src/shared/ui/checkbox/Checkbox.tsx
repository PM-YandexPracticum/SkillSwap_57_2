import { useState } from 'react'
import checkIcon from '../../assets/check.svg'
import dashIcon from '../../assets/dash.svg'
import defaultIcon from '../../assets/default.svg'
import './Checkbox.css'

export type CheckboxState = 'default' | 'opened' | 'checked'
export type CheckboxMode = 'open' | 'check'

interface CheckboxProps {
  /** Подпись рядом с чекбоксом. Может отсутствовать, если подпись рисуется отдельно. */
  text?: string
  /** Начальное состояние в неуправляемом режиме. */
  state?: CheckboxState
  /** Режим неуправляемого переключения: 'open' — раскрытие, 'check' — выбор. */
  mode?: CheckboxMode
  /** Управляемое значение. Если передано — компонент становится управляемым. */
  checked?: boolean
  /** Частичный выбор (показывает прочерк). Используется для родительских категорий. */
  indeterminate?: boolean
  /** Колбэк переключения в управляемом режиме. */
  onChange?: (checked: boolean) => void
  /** Доступное имя, когда видимой подписи нет. */
  ariaLabel?: string
  className?: string
}

export const Checkbox = ({
  text = '',
  state = 'default',
  mode = 'check',
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
  className = '',
}: CheckboxProps) => {
  const [currentState, setCurrentState] = useState<CheckboxState>(state)
  const isControlled = checked !== undefined

  const visualState: CheckboxState = isControlled
    ? indeterminate
      ? 'opened'
      : checked
        ? 'checked'
        : 'default'
    : currentState

  const handleToggle = () => {
    if (isControlled) {
      // Из частичного состояния клик переводит категорию в полностью выбранное
      onChange?.(indeterminate ? true : !checked)
      return
    }

    if (mode === 'open') {
      setCurrentState((prev) => (prev === 'default' ? 'opened' : 'default'))
      return
    }

    setCurrentState((prev) => (prev === 'default' ? 'checked' : 'default'))
  }

  const wrapperClassName = ['checkbox-wrapper', className].filter(Boolean).join(' ')

  return (
    <label className={wrapperClassName}>
      <span
        className={`checkbox checkbox_${visualState}`}
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : visualState === 'checked'}
        aria-label={ariaLabel}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            handleToggle()
          }
        }}
      >
        {visualState === 'default' && <img className="checkboxicon" src={defaultIcon} alt="" />}

        {visualState === 'opened' && <img className="checkboxicon" src={dashIcon} alt="" />}

        {visualState === 'checked' && <img className="checkboxicon" src={checkIcon} alt="" />}
      </span>

      {text && (
        <span className="checkbox__text" onClick={handleToggle}>
          {text}
        </span>
      )}
    </label>
  )
}
