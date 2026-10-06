import { useClickOutside } from '@/shared/hooks/useClickOutside'
import SkillsList from '@/shared/ui/SkillsList/SkillsList'
import { useCallback, useRef, useState } from 'react'
import styles from './NavMenu.module.css'
import arrow from '@/shared/assets/images/arrow.svg'

export const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLLIElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

  useClickOutside(wrapperRef, close, isOpen)

  return (
    <nav className={styles.navMenu}>
      <ul className={styles.navList}>
        <li>О проекте</li>
        <li className={styles.navElemWrapper} ref={wrapperRef}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            Все навыки
            <img
              src={arrow}
              alt=""
              aria-hidden="true"
              className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
            />
          </button>

          {isOpen && (
            <div className={styles.dropdown}>
              <SkillsList />
            </div>
          )}
        </li>
      </ul>
    </nav>
  )
}
