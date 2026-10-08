import type { ButtonHTMLAttributes, ReactNode } from 'react'
import chevronDownIcon from '@/shared/assets/images/chevron-down.svg'
import chevronUpIcon from '@/shared/assets/images/chevron-up.svg'
import styles from './OpenFilterButton.module.css'

export interface OpenFilterButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  isOpen: boolean
}

export function OpenFilterButton({
  children,
  isOpen,
  className,
  type = 'button',
  ...props
}: OpenFilterButtonProps) {
  const buttonClassName = [styles.button, className].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      className={buttonClassName}
      type={type}
      aria-expanded={isOpen}
    >
      <span>{isOpen ? 'Скрыть' : children}</span>
      <img
        className={styles.icon}
        src={isOpen ? chevronUpIcon : chevronDownIcon}
        alt=""
        aria-hidden="true"
      />
    </button>
  )
}
