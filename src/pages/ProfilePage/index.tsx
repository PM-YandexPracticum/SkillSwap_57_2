import { useEffect, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '@/shared/ui/Header/Header'
import { Footer } from '@/shared/ui/Footer/Footer'
import defaultAvatar from '@/shared/assets/default.svg'
import { ProfileMenu } from './ui/ProfileMenu'
import { PersonalData, type PersonalDataValue } from './ui/PersonalData'
import styles from './ProfilePage.module.css'
import { fetchUserById } from '@/api/users'
import { fetchCities } from '@/api/cities'
import { useAppSelector } from '@/store/hooks'

const availableSections = ['requests', 'exchanges', 'skills', 'personal'] as const
type AvailableSection = (typeof availableSections)[number]

const sectionTitles: Record<Exclude<AvailableSection, 'personal'>, string> = {
  requests: 'Заявки',
  exchanges: 'Мои обмены',
  skills: 'Мои навыки',
}

function isAvailableSection(value: string | null): value is AvailableSection {
  return !!value && (availableSections as readonly string[]).includes(value)
}

function formatBirthDate(value?: string) {
  if (!value) return 'Не указана'
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}.${month}.${year}` : value
}

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const authUser = useAppSelector((state) => state.auth.user)
  const requestedSection = searchParams.get('section')
  const activeSection: AvailableSection = isAvailableSection(requestedSection)
    ? requestedSection
    : 'personal'

  const [personalData, setPersonalData] = useState<PersonalDataValue | null>(null)
  const [loadError, setLoadError] = useState(false)

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
      <Footer />
    </div>
  )
}
