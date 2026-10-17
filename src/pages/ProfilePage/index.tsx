import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Header } from '@/shared/ui/Header/Header'
import { Footer } from '@/shared/ui/Footer/Footer'
import { Card } from '@/shared/ui/Card'
import defaultAvatar from '@/shared/assets/default.svg'
import { ProfileMenu, type ProfileSection } from './ui/ProfileMenu'
import { PersonalData, type PersonalDataValue } from './ui/PersonalData'
import styles from './ProfilePage.module.css'
import { fetchUserById, fetchUsers } from '@/api/users'
import { fetchCities } from '@/api/cities'
import { useAppSelector } from '@/store/hooks'
import { skills } from '@/shared/ui/SkillCategoryGroupList/model/SkillGroupList'
import type { User } from '@/shared/types'

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
  const authUser = useAppSelector((state) => state.auth.user)
  const requestedSection = searchParams.get('section') as ProfileSection | null
  const activeSection =
    requestedSection && availableSections.includes(requestedSection)
      ? requestedSection
      : 'personal'

  const [personalData, setPersonalData] = useState<PersonalDataValue | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [favoriteUsers, setFavoriteUsers] = useState<User[]>([])
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false

    setPersonalData(null)
    setProfileUser(null)
    setFavoriteUsers([])
    setLoadError(false)

    if (!authUser?.id) {
      setLoadError(true)
      return () => {
        cancelled = true
      }
    }

    Promise.all([fetchUserById(authUser.id), fetchUsers(), fetchCities()])
      .then(([user, users, cities]) => {
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

        setProfileUser(user)
        setFavoriteUsers(
          user.likesCard
            .map((favoriteId) => users.find((candidate) => candidate.id === favoriteId))
            .filter((favorite): favorite is User => Boolean(favorite)),
        )
        setPersonalData(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [authUser?.id])

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
      if (!profileUser && !loadError) {
        return <section className={styles.placeholder}>Загружаем избранное...</section>
      }

      return (
        <section className={styles.favorites}>
          <h1>Избранное</h1>
          {favoriteUsers.length > 0 ? (
            <div className={styles.favoritesGrid}>
              {favoriteUsers.map((user) => (
                <Card
                  key={user.id}
                  user={user}
                  teach={user.teach.map(getSkillItem)}
                  learn={user.learn.map(getSkillItem)}
                  isLiked
                  onLikeChange={(isLiked) => {
                    if (!isLiked) {
                      setFavoriteUsers((current) =>
                        current.filter((favorite) => favorite.id !== user.id),
                      )
                    }
                  }}
                  onDetailsClick={() => navigate(`/skill/${user.teach[0] ?? user.id}`)}
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
