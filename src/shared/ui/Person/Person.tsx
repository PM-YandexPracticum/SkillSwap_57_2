import type { User } from '@/shared/types'
import { FC } from 'react'
import { Title } from '../Title'
import styles from './Person.module.css'

interface PersonProps {
  user: User
}

export const Person: FC<PersonProps> = ({ user }) => {
  return (
    <div className={styles.person}>
      {/* <Avatar></Avatar> */}
      <div>
        <Title size="H2">{user.name}</Title>
        {/* <p className={styles.details}>{user.city}, </p> */}
      </div>
    </div>
  )
}
