import { Footer } from '@/shared/ui/Footer/Footer'
import { Header } from '@/shared/ui/Header/Header'
import { Outlet } from 'react-router-dom'
import styles from './MainLayout.module.css'

export function MainLayout() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.content}>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
