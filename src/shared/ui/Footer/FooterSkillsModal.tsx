import { useEffect, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from '@/shared/ui/Modal/Modal'
import { Title } from '@/shared/ui/Title'
import SkillCategoryGroupList from '@/shared/ui/SkillCategoryGroupList/SkillCategoryGroupList'
import cross from '@/shared/assets/images/cross.svg'
import styles from './FooterSkillsModal.module.css'

export function FooterSkillsModal({ onClose }: { onClose: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const trigger = document.activeElement
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true })
      }
    }
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const items = contentRef.current?.querySelectorAll<HTMLElement>('button, a[href]')
    if (!items?.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <Modal onClose={onClose} onOverlayClick={onClose} ariaLabel="Все навыки">
      <div className={styles.content} ref={contentRef} onKeyDown={handleKeyDown}>
        <div className={styles.heading}>
          <Title size="H2">Все навыки</Title>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Закрыть окно навыков">
            <img src={cross} alt="" width={24} height={24} />
          </button>
        </div>
        <div
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest('a')) onClose()
          }}
        >
          <SkillCategoryGroupList />
        </div>
      </div>
    </Modal>,
    document.body,
  )
}
