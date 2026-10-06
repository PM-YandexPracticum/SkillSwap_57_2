import SkillsList from '@/shared/ui/SkillsList/SillCategoryGroupList'
import styles from './SkillPage.module.css'

const SkillPage = () => {
  return (
    <main>
      <div className={styles.skillsWrapper}>
        <SkillsList />
      </div>
    </main>
  )
}

export default SkillPage
