import { useEffect, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '@/shared/ui/Header/Header'
import { Footer } from '@/shared/ui/Footer/Footer'
import defaultAvatar from '@/shared/assets/default.svg'
import { ProfileMenu } from './ui/ProfileMenu'
import { PersonalData } from './ui/PersonalData'
import styles from './ProfilePage.module.css'
import { fetchUserById } from '@/api/users'
import { fetchCities } from '@/api/cities'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { City, User } from '@/shared/types'
import { getProfileChanges, getRegisteredItems, saveProfileChanges } from '@/shared/lib/registrationStorage'
import { updateCurrentUser } from '@/entities/user/model/usersSlice'
import { updateAuthUser } from '@/features/auth/model/authSlice'
import { getAuthUser } from '@/features/auth/model/authUtils'

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

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const authUser = useAppSelector((state) => state.auth.user)
  const requestedSection = searchParams.get('section')
  const activeSection: AvailableSection = isAvailableSection(requestedSection)
    ? requestedSection
    : 'personal'

  const [personalData, setPersonalData] = useState<User | null>(null)
  const [cities, setCities] = useState<City[]>([])
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

    Promise.all([fetchUserById(authUser.id).catch(() => undefined), fetchCities()])
      .then(([mockUser, loadedCities]) => {
        if (cancelled) return
        const user = getProfileChanges().find((item) => item.id === authUser.id)
          ?? getRegisteredItems().users.find((item) => item.id === authUser.id)
          ?? mockUser
          ?? (authUser.id === 'demo-user' ? {
            id: authUser.id,
            name: getAuthUser()?.name ?? '',
            email: getAuthUser()?.email ?? '',
            avatar: null,
            aboutMe: '',
            gender: 'unspecified' as const,
            city: '',
            birthDate: '',
            createdAt: new Date().toISOString(),
            likesCount: 0,
            likesCard: [],
            teach: [],
            learn: [],
          } : undefined)
        if (!user) {
          setLoadError(true)
          return
        }
        setCities(loadedCities)
        setPersonalData(user)
        dispatch(updateCurrentUser(user))
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [authUser?.id, dispatch])

  const save = (user: User, password?: string) => {
    if (user.id !== authUser?.id) throw new Error('Не удалось определить текущего пользователя')
    saveProfileChanges(user, password)
    dispatch(updateCurrentUser(user))
    dispatch(updateAuthUser({ id: user.id, name: user.name, email: user.email }))
    setPersonalData(user)
  }

  const renderSection = () => {
    if (activeSection === 'personal') {
      if (personalData) return <PersonalData key={authUser?.id} value={personalData} cities={cities} onSave={save} />

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
    '--profile-avatar': `url("${personalData?.avatar ?? defaultAvatar}")`,
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
