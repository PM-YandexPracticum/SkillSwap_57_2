// TODO: реализовать страницу CatalogPage

import { FiltersPanel } from '@/shared/ui/FiltersPanel'
import styles from './CatalogPage.module.css'

export default function CatalogPage() {
  return (
    <main className={styles.wrapper}>
      <FiltersPanel />
    </main>
  )
}
