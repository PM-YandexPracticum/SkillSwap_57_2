import styles from './Footer.module.css'
import { Logo } from '../logo'
import { Link } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { FooterSkillsModal } from './FooterSkillsModal'

export const Footer = () => {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const closeSkills = useCallback(() => setSkillsOpen(false), [])

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>
          <Logo />
          <span className={styles.text}>SkillSwap — 2025</span>
        </div>
        <nav className={styles.nav} aria-label="Навигация в подвале">
          <ul className={styles.list}>
            <li className={styles.listElem}>
              <Link to="/">О проекте</Link>
            </li>
            <li className={styles.listElem}>
              <Link to="/">Контакты</Link>
            </li>
            <li className={styles.listElem}>
              <Link to="/">Политика конфиденциальности</Link>
            </li>
            <li className={styles.listElem}>
              <button
                type="button"
                className={styles.skillsButton}
                aria-haspopup="dialog"
                aria-expanded={skillsOpen}
                onClick={() => setSkillsOpen(true)}
              >
                Все навыки
              </button>
            </li>
            <li className={styles.listElem}>
              <Link to="/">Блог</Link>
            </li>
            <li className={styles.listElem}>
              <Link to="/">Пользовательское соглашение</Link>
            </li>
          </ul>
        </nav>
      </div>
      {skillsOpen && <FooterSkillsModal onClose={closeSkills} />}
    </footer>
  )
}
