import SkillsList from '@/shared/ui/SkillsList/SkillsList'
import styles from './SkillPage.module.css'

export const SkillPage = () => {
  return (
    <main>
      <div className={styles.skillsWrapper}>
        <SkillsList />
      </div>
    </main>
  )
}
