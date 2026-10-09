import { Skill } from '@/shared/ui/Skill'
import { Title } from '@/shared/ui/Title'
import styles from './SkillsList.module.css'

const DEFAULT_MAX_VISIBLE = 2

export interface SkillsListItem {
  id: string
  title: string
  category?: string
}

interface SkillsListProps {
  title?: string
  skills: SkillsListItem[]
  maxVisible?: number
}

export const SkillsList = ({
  title,
  skills,
  maxVisible = DEFAULT_MAX_VISIBLE,
}: SkillsListProps) => {
  if (skills.length === 0) return null

  const visibleSkills = skills.slice(0, maxVisible)
  const hiddenCount = skills.length - visibleSkills.length

  return (
    <div className={styles.skillsList}>
      {title && (
        <Title size='H4' className={styles.title}>
          {title}
        </Title>
      )}
      <div className={styles.list}>
        {visibleSkills.map((skill) => (
          <Skill key={skill.id} category={skill.category} title={skill.title} />
        ))}
        {hiddenCount > 0 && <Skill title={`+${hiddenCount}`} />}
      </div>
    </div>
  )
}