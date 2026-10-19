import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchSkills } from '@/entities/skill/model/skillsSlice'
import { fetchUsers } from '@/entities/user/model/usersSlice'
import { removeFavorite, selectFavoriteIds } from '@/features/favorites/model/favoritesSlice'
import { Header } from '@/shared/ui/Header/Header'
import { Footer } from '@/shared/ui/Footer/Footer'
import { Card } from '@/shared/ui/Card'
import defaultAvatar from '@/shared/assets/default.svg'
import { ProfileMenu, type ProfileSection } from './ui/ProfileMenu'
import { PersonalData, type PersonalDataValue } from './ui/PersonalData'
import styles from './ProfilePage.module.css'
import { fetchUserById } from '@/api/users'
import { fetchCities } from '@/api/cities'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'

const sectionTitles: Record<Exclude<ProfileSection, 'personal' | 'favorites'>, string> = {
  requests: 'Заявки',
  exchanges: 'Мои обмены',
  skills: 'Мои навыки',
}

const availableSections: ProfileSection[] = [
  'requests',
  'exchanges',
  'favorites',
  'skills',
  'personal',
]

function formatBirthDate(value?: string) {
  if (!value) return 'Не указана'
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}.${month}.${year}` : value
}

const skillItems = skills.flatMap((category) =>
  category.skills.map((skill) => ({ ...skill, category: category.id })),
)

function getSkillItem(skillId: string) {
  const numericId = /^skill_(\d+)$/.exec(skillId)?.[1]
  const skill = numericId
    ? skillItems[Number(numericId) - 1]
    : skillItems.find((item) => item.id === skillId)

  return skill ?? { id: skillId, title: skillId }
}

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const authUser = useAppSelector((state) => state.auth.user)
  const favoriteIds = useAppSelector(selectFavoriteIds)
  const allSkills = useAppSelector((state) => state.skills.items)
  const skillsStatus = useAppSelector((state) => state.skills.status)
  const allUsers = useAppSelector((state) => state.users.items)
  const usersStatus = useAppSelector((state) => state.users.status)
  const requestedSection = searchParams.get('section') as ProfileSection | null
  const activeSection =
    requestedSection && availableSections.includes(requestedSection)
      ? requestedSection
      : 'personal'

  const [personalData, setPersonalData] = useState<PersonalDataValue | null>(null)
  const [loadError, setLoadError] = useState(false)

  // Избранное берём из общего стора: при прямом заходе справочники могут быть пустыми.
  useEffect(() => {
    if (skillsStatus === 'idle') void dispatch(fetchSkills())
    if (usersStatus === 'idle') void dispatch(fetchUsers())
  }, [dispatch, skillsStatus, usersStatus])

  useEffect(() => {
    let cancelled = false

    setPersonalData(null)
    setLoadError(false)

    if (!authUser?.id) {
      setLoadError(true)
      return () => {
        cancelled = true
      }
    }

    Promise.all([fetchUserById(authUser.id), fetchCities()])
      .then(([user, cities]) => {
        if (cancelled) return
        if (!user) {
          setLoadError(true)
          return
        }

        const genderLabels = {
          female: 'Женский',
          male: 'Мужской',
          unspecified: 'Не указан',
        } as const

        const cityObj = cities.find((c) => c.id === user.city)

        const data: PersonalDataValue = {
          email: user.email,
          name: user.name,
          birthDate: formatBirthDate(user.birthDate),
          gender: genderLabels[user.gender] ?? 'Не указан',
          city: cityObj?.title ?? 'Не указан',
          aboutMe: user.aboutMe ?? 'Расскажите немного о себе',
          avatarUrl: user.avatar || defaultAvatar,
        }

        setPersonalData(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [authUser?.id])

  /** Избранные предложения собираем по общему идентификатору — skill.id. */
  const favoriteCards = useMemo(
    () =>
      favoriteIds.flatMap((skillId) => {
        const skill = allSkills.find((item) => item.id === skillId)
        if (!skill) return []

        const author = allUsers.find((user) => user.teach.includes(skill.id))
        if (!author) return []

        return [{ skill, author }]
      }),
    [favoriteIds, allSkills, allUsers],
  )

  const handleRemoveFavorite = useCallback(
    (skillId: string, isLiked: boolean) => {
      if (!isLiked) dispatch(removeFavorite(skillId))
    },
    [dispatch],
  )

  const renderSection = () => {
    if (activeSection === 'personal') {
      if (personalData) return <PersonalData key={authUser?.id} value={personalData} />

      if (loadError) {
        return (
          <section className={styles.placeholder}>
            Не удалось загрузить данные текущего пользователя.
          </section>
        )
      }

      return <section className={styles.placeholder}>Загружаем данные профиля...</section>
    }

    if (activeSection === 'favorites') {
      const isFavoritesLoading =
        favoriteIds.length > 0 &&
        (skillsStatus === 'idle' ||
          skillsStatus === 'loading' ||
          usersStatus === 'idle' ||
          usersStatus === 'loading')

      if (isFavoritesLoading) {
        return <section className={styles.placeholder}>Загружаем избранное...</section>
      }

      return (
        <section className={styles.favorites}>
          <h1>Избранное</h1>
          {favoriteCards.length > 0 ? (
            <div className={styles.favoritesGrid}>
              {favoriteCards.map(({ skill, author }) => (
                <Card
                  key={skill.id}
                  user={author}
                  teach={author.teach.map(getSkillItem)}
                  learn={author.learn.map(getSkillItem)}
                  isLiked={favoriteIds.includes(skill.id)}
                  onLikeChange={(isLiked) => handleRemoveFavorite(skill.id, isLiked)}
                  onDetailsClick={() => navigate(`/skill/${skill.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyFavorites}>В избранном пока нет предложений.</p>
          )}
        </section>
      )
    }

    return (
      <section className={styles.placeholder}>
        <h1>{sectionTitles[activeSection]}</h1>
        <p>Раздел находится в разработке.</p>
      </section>
    )
  }

  const pageStyle = {
    '--profile-avatar': `url("${personalData?.avatarUrl ?? defaultAvatar}")`,
  } as CSSProperties

  return (
    <div className={styles.page} style={pageStyle}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <ProfileMenu activeSection={activeSection} />
          {renderSection()}
        </div>
      </main>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  )
}
