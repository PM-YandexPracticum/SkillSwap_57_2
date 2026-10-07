import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import styles from './Skill.module.css'

const DEFAULT_COLOR = '#e8ecf7'

interface SkillProps {
  category?: string
  title: string
}

export const Skill = ({ category, title }: SkillProps) => {
  const color = skills.find((item) => item.id === category)?.color ?? DEFAULT_COLOR

  return (
    <span className={styles.skill} style={{ backgroundColor: color }}>
      {title}
    </span>
  )
}