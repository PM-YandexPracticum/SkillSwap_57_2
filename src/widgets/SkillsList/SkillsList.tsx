import SkillCategoryGroup from '@/shared/ui/SkillCategoryGroup/SkillCategoryGroup'
import styles from './SkillsList.module.css'
import { skills } from '@/shared/ui/SkillCategoryGroup/model/Skills'

function SkillsList() {
  return (
    <div className={styles.container}>
      {skills.map((category) => (
        <SkillCategoryGroup
          key={category.id}
          icon={category.icon}
          color="#eee7f7"
          title={category.title}
          skillArray={category.skills}
        />
      ))}
    </div>
  )
}

export default SkillsList
