import { SkillCategoryGroup } from '@/shared/ui/SkillCategoryGroup/SkillCategoryGroup'
import styles from './SkillCategoryGroupList.module.css'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'

function SkillCategoryGroupList() {
  return (
    <div className={styles.grid}>
      {skills.map((category) => (
        <SkillCategoryGroup
          key={category.id}
          icon={category.icon}
          color={category.color}
          title={category.title}
          skillArray={category.skills}
        />
      ))}
    </div>
  )
}

export default SkillCategoryGroupList
