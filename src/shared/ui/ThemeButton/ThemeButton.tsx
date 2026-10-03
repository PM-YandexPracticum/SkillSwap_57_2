import { useState } from 'react'
import moonImg from '../../../assets/images/moon.svg'
import sunImg from '../../../assets/images/sun.svg'
import styles from './ThemeButton.module.css'

export const ThemeButton = () => {
  // тема сайта не переключается (заглушка)
  const [isDark, setIsDark] = useState(false)

  const handleClick = () => setIsDark((prev) => !prev)

  return (
    <button
      className={styles.button}
      type="button"
      onClick={handleClick}
      aria-label="Переключить тему"
    >
      <img className={styles.icon} src={isDark ? sunImg : moonImg} alt="" />
    </button>
  )
}