import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './SkillCategoryGroup.module.css'

export type Skill = {
  id: string
  title: string
}

export interface SkillCategoryGroupProps {
  icon: ReactNode
  color: string
  title: string
  skillArray: readonly Skill[]
}

export const SkillCategoryGroup = ({ icon, color, title, skillArray }: SkillCategoryGroupProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconRound} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className={styles.text}>
        <h3 className={styles.title}>{title}</h3>
        <ul className={styles.skillList}>
          {skillArray.map((item) => (
            <li key={item.id} className={styles.skill}>
              <Link to={item.id}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
