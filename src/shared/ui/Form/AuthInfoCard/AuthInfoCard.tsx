import type { FC } from 'react'
import styles from './AuthInfoCard.module.css'

export interface AuthInfoCardProps {
  illustration: string
  title: string
  description: string
}

export const AuthInfoCard: FC<AuthInfoCardProps> = ({ illustration, title, description }) => (
  <aside className={styles.card} aria-label={title}>
    <div className={styles.content}>
      <img className={styles.illustration} src={illustration} alt='' aria-hidden='true' />
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  </aside>
)
