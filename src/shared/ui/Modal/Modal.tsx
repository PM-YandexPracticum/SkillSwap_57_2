import { useEffect } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import styles from './Modal.module.scss'

interface ModalProps {
  children: ReactNode
  onClose: () => void
  onOverlayClick?: () => void
}

export function Modal({ children, onClose, onOverlayClick }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onOverlayClick?.()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  )
}
