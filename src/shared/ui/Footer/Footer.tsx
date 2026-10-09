import React from 'react'
import styles from './Footer.module.css'
import { Logo } from '../logo'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logoWrapper}>
        <Logo />
        <span className={styles.text}>SkillSwap — 2025</span>
      </div>
      <nav className={styles.nav}>
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
            <Link to="/">Все навыки</Link>
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
  )
}
