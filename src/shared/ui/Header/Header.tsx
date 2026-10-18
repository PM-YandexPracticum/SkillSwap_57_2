import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/features/auth/model/authSlice'
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/model/authSelectors'
import { ROUTES } from '@/shared/lib/constants'
import { Logo } from '../logo/logo'
import { Button } from '../Button/Button'
import { NavMenu } from '../NavMenu/NavMenu'
import { Input } from '../Input/Input'
import { ThemeButton } from '../ThemeButton/ThemeButton'
import { NotifyButton } from '../NotifyButton/NotifyButton'
import { LikeButton } from '../LikeButton/LikeButton'
import { Avatar } from '../Avatar/Avatar'
import searchIcon from '../../assets/images/search.svg'
import styles from './Header.module.scss'

interface HeaderProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
}

/** Имя по умолчанию, если пользователь авторизован, но имя ещё не загружено. */
const DEFAULT_USER_NAME = 'Имя пользователя'

export function Header({ searchValue, onSearchChange }: HeaderProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Данные авторизации берём из стора через общие селекторы.
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)

  // В auth-состоянии хранятся только id/имя/email, поэтому аватар ищем в профиле
  // пользователя (users), сопоставляя запись по id или email.
  const avatarUrl = useAppSelector((state) => {
    if (!user) return undefined
    const profile = state.users.items.find(
      (item) => item.id === user.id || item.email === user.email,
    )
    return profile?.avatar ?? undefined
  })

  const userName = user?.name ?? DEFAULT_USER_NAME

  const handleLogout = () => {
    void dispatch(logout())
  }

  return (
    <>
      <header
        className={[
          styles.header,
          isAuthenticated ? styles.authenticated : styles.unauthenticated,
        ].join(' ')}
      >
        <div className={styles.container}>
          <div className={styles.left}>
            <Logo />
            <NavMenu />
          </div>

          <div className={styles.search}>
            <Input
              variant="search"
              type="search"
              aria-label="Поиск навыков"
              placeholder="Искать навык"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.currentTarget.value)}
              startIcon={<img src={searchIcon} alt="" aria-hidden="true" />}
            />
          </div>

          <div className={styles.right}>
            <ThemeButton />

            {!isAuthenticated ? (
              <div className={styles.auth}>
                <Button variant="secondary" onClick={() => navigate(ROUTES.LOGIN)}>
                  Войти
                </Button>

                <Button variant="primary" onClick={() => navigate(ROUTES.REGISTER)}>
                  Зарегистрироваться
                </Button>
              </div>
            ) : (
              <div className={styles.userActions}>
                <NotifyButton hasNotifications={false} />

                <LikeButton
                  checked={false}
                  onChange={() => {}}
                  onClick={() => navigate(ROUTES.FAVORITES)}
                  className={styles.likes}
                  aria-label="Избранное"
                />

                <button
                  className={styles.profile}
                  type="button"
                  aria-label="Личный кабинет"
                  onClick={() => navigate(ROUTES.PROFILE)}
                >
                  <span className={styles.userName}>{userName}</span>
                  <Avatar src={avatarUrl} alt={`Аватар пользователя ${userName}`} size="small" />
                </button>

                <Button
                  variant="secondary"
                  className={styles.logout}
                  aria-label="Выйти из аккаунта"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* После того, как смержен модал
      {isSkillsModalOpen && (
        <Modal onClose={handleCloseSkills} onOverlayClick={handleCloseSkills}>
          <div className={styles.skillsModal}>
            <h2 className={styles.skillsTitle}>Все навыки</h2>

            <SkillCategoryGroupList />
          </div>
        </Modal>
      )} */}
    </>
  )
}
