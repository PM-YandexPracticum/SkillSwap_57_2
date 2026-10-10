//import { useState } from 'react'
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
  isAuthenticated?: boolean
  userName?: string
  avatarUrl?: string
}

export function Header({
  isAuthenticated = false, //когда будет реализована авторизация использовать  isAuthenticated={user.isAuthenticated}
  userName = 'Имя пользователя', //когда будет реализована авторизация использовать  userName={user.name}
  // avatarUrl, // когда будет реализована авторизация использовать  avatarUrl={user.avatar}
}: HeaderProps) {
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
              placeholder="Искать навык"
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
