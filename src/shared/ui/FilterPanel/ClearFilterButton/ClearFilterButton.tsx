import type { ButtonHTMLAttributes } from 'react'
import clearFilterIcon from '../../../assets/images/cross.svg'
import { Button } from '../../Button/Button'
import styles from './ClearFilterButton.module.scss'

type ClearFilterButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function ClearFilterButton({ className = '', ...props }: ClearFilterButtonProps) {
  return (
    <Button
      {...props}
      type="button"
      variant='tertiary'
      className={`${styles.button} ${className}`}
      aria-label="Сбросить фильтры"
    >
      <span>Сбросить</span>
      <img src={clearFilterIcon} alt="" className={styles.icon} />
    </Button>
  )
}
