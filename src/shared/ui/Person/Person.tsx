import type { User } from '@/shared/types'
import { FC } from 'react'
import { Title } from '../Title'
import styles from './Person.module.css'
import { Avatar } from '../Avatar'
import { getAge, plural } from '@/shared/lib/helpers'

interface PersonProps {
  user: User
}

export const Person: FC<PersonProps> = ({ user }) => {
  const age = getAge(new Date(user.birthDate))
  return (
    <div className={styles.person}>
      <Avatar src={user.avatar ?? undefined}></Avatar>
      <div className={styles.info}>
        <Title size="H2">{user.name}</Title>
        <p className={styles.details}>
          {user.city}, {plural(age, 'лет', 'год', 'года')}
        </p>
      </div>
    </div>
  )
}
