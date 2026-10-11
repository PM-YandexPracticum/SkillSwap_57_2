import type { FC } from 'react'
import { Title } from '@/shared/ui/Title'
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
        <Title size='H3' className={styles.title}>
          {title}
        </Title>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  </aside>
)
