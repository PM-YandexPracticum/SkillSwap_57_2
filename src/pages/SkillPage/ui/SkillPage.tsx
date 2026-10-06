import SkillCategoryGroupList from '@/shared/ui/SkillCategoryGroupList/SkillCategoryGroupList'
import styles from './SkillPage.module.css'

const SkillPage = () => {
  return (
    <main>
      <div className={styles.skillsWrapper}>
        <SkillCategoryGroupList />
      </div>
    </main>
  )
}

export default SkillPage
