import { SkillCategoryGroup } from '@/shared/ui/SkillCategoryGroup/SkillCategoryGroup'
import styles from './SkillCategoryGroupList.module.css'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'

function SkillCategoryGroupList({
  className,
  linked = true,
}: {
  className?: string
  linked?: boolean
}) {
  return (
    <div className={[styles.grid, className].filter(Boolean).join(' ')}>
      {skills.map((category) => (
        <SkillCategoryGroup
          key={category.id}
          icon={category.icon}
          color={category.color}
          title={category.title}
          skillArray={category.skills}
          linked={linked}
        />
      ))}
    </div>
  )
}

export default SkillCategoryGroupList
