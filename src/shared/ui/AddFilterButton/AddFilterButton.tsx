import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import crossIcon from '@/shared/assets/images/cross.svg'
import { Button } from '@/shared/ui/Button'
import styles from './AddFilterButton.module.css'

export interface AddFilterButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  onRemove?: MouseEventHandler<HTMLButtonElement>
}

export function AddFilterButton({
  children,
  className,
  type = 'button',
  onClick,
  onRemove,
  ...props
}: AddFilterButtonProps) {
  const buttonClassName = [styles.button, className].filter(Boolean).join(' ')

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onRemove?.(event)
    onClick?.(event)
  }

  return (
    <Button
      {...props}
      className={buttonClassName}
      type={type}
      variant="tertiary"
      onClick={handleClick}
    >
      <span className={styles.label}>{children}</span>
      <img className={styles.icon} src={crossIcon} alt="" aria-hidden="true" />
    </Button>
  )
}
