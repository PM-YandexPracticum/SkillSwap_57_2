import type { ComponentProps } from 'react'
import type { User } from '@/shared/types'
import { Button } from '@/shared/ui/Button/Button'
import { LikeButton } from '@/shared/ui/LikeButton'
import { Person } from '@/shared/ui/Person'
import { SkillsList } from '@/shared/ui/SkillsList'
import styles from './Card.module.css'

type SkillItems = ComponentProps<typeof SkillsList>['skills']

interface CardProps {
  user: User
  teach: SkillItems
  learn: SkillItems
  isLiked: boolean
  onLikeChange: (isLiked: boolean) => void
  onDetailsClick: () => void
}

export const Card = ({
  user,
  teach,
  learn,
  isLiked,
  onLikeChange,
  onDetailsClick,
}: CardProps) => (
  <div className={styles.card}>
    <LikeButton
      className={styles.like}
      checked={isLiked}
      onChange={(event) => onLikeChange(event.target.checked)}
      aria-label='Добавить в избранное'
    />
    <Person user={user} />
    <div className={styles.skills}>
      <SkillsList title='Может научить:' skills={teach} />
      <SkillsList title='Хочет научиться:' skills={learn} />
    </div>
    <Button className={styles.button} onClick={onDetailsClick}>
      Подробнее
    </Button>
  </div>
)
