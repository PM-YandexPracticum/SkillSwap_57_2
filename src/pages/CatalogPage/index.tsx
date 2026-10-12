import { useEffect } from 'react'
import { Link, generatePath } from 'react-router-dom'
import { fetchSkills } from '@/entities/skill/model/skillsSlice'
import { useSkillSearch } from '@/features/search/model/useSkillSearch'
import { ROUTES } from '@/shared/lib/constants'
import { Header } from '@/shared/ui/Header/Header'
import { Title } from '@/shared/ui/Title'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './CatalogPage.module.css'

export default function CatalogPage() {
  const dispatch = useAppDispatch()
  const { items, status } = useAppSelector((state) => state.skills)
  const { query, setQuery, filteredSkills, count } = useSkillSearch(items)

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchSkills())
  }, [dispatch, status])

  return (
    <>
      <Header searchValue={query} onSearchChange={setQuery} />
      <main className={styles.catalog}>
        <Title size="H1">Все навыки</Title>
        {status === 'idle' || status === 'loading' ? (
          <p role="status">Загрузка навыков…</p>
        ) : status === 'failed' ? (
          <p role="alert">Не удалось загрузить навыки. Попробуйте обновить страницу.</p>
        ) : (
          <>
            <p role="status">Найдено навыков: {count}</p>
            {count === 0 ? (
              <p>Ничего не найдено. Попробуйте изменить запрос.</p>
            ) : (
              <ul className={styles.results} aria-label="Результаты поиска">
                {filteredSkills.map((skill) => (
                  <li key={skill.id}>
                    <Link to={generatePath(ROUTES.SKILL, { id: skill.id })}>{skill.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </>
  )
}
