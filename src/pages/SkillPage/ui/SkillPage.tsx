import SkillsList from '@/shared/ui/SkillsList/SkillsList'
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
