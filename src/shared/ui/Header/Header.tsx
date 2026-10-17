//import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/model/authSelectors'
import { Logo } from '../logo/logo'
import { Button } from '../Button/Button'
import { NavMenu } from '../NavMenu/NavMenu'
import { Input } from '../Input/Input'
import { ThemeButton } from '../ThemeButton/ThemeButton'
import { NotifyButton } from '../NotifyButton/NotifyButton'
import { LikeButton } from '../LikeButton/LikeButton'
//import { Avatar } from '../Avatar/Avatar'
//import { Modal } from '../Modal/Modal'
//import SkillCategoryGroupList from '../SkillCategoryGroupList/SkillCategoryGroupList'
import searchIcon from '../../assets/images/search.svg'
import styles from './Header.module.scss'

interface HeaderProps {
  avatarUrl?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
}

/** Имя по умолчанию, если пользователь авторизован, но имя ещё не загружено. */
const DEFAULT_USER_NAME = 'Имя пользователя'

export function Header({ searchValue, onSearchChange }: HeaderProps) {
  // Данные авторизации берём из стора через общие селекторы.
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectCurrentUser)
  const userName = user?.name ?? DEFAULT_USER_NAME
  //После того, как смержен модал
  // const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false)

  // const handleOpenSkills = () => {
  // setIsSkillsModalOpen(true)
  // }

  // const handleCloseSkills = () => {
  //  setIsSkillsModalOpen(false)
  // }

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
                <Button variant="secondary">Войти</Button>

                <Button variant="primary">Зарегистрироваться</Button>
              </div>
            ) : (
              <div className={styles.userActions}>
                <NotifyButton hasNotifications={false} />

                <LikeButton
                  checked={false}
                  onChange={() => {}}
                  className={styles.likes}
                  aria-label="Лайки"
                />

                <button className={styles.profile} type="button" aria-label="Профиль пользователя">
                  <span className={styles.userName}>{userName}</span>
                  <div className={styles.avatar} aria-hidden="true" />
                </button>

                {/* После того, как смержен аватар, заменить на
                <button className={styles.profile} type="button">
                <span className={styles.userName}>{userName}</span>
                  <Avatar src={avatarUrl} alt={`Аватар пользователя ${userName}`} size="middle" />
                </button>
                */}
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
