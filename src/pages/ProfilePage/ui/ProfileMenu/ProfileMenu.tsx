import { Link } from 'react-router-dom'
import requestIcon from '@/shared/assets/images/request.svg'
import exchangesIcon from '@/shared/assets/images/message-text.svg'
import favoriteIcon from '@/shared/assets/images/empty like.svg'
import skillsIcon from '@/shared/assets/images/idea.svg'
import profileIcon from '@/shared/assets/images/user.svg'
import styles from './ProfileMenu.module.css'

export type ProfileSection = 'requests' | 'exchanges' | 'favorites' | 'skills' | 'personal'

interface ProfileMenuProps {
  activeSection: ProfileSection
}

const menuItems: Array<{
  id: ProfileSection
  title: string
  icon: string
  href: string
}> = [
  { id: 'requests', title: 'Заявки', icon: requestIcon, href: '/profile?section=requests' },
  { id: 'exchanges', title: 'Мои обмены', icon: exchangesIcon, href: '/profile?section=exchanges' },
  { id: 'favorites', title: 'Избранное', icon: favoriteIcon, href: '/favorites' },
  { id: 'skills', title: 'Мои навыки', icon: skillsIcon, href: '/profile?section=skills' },
  { id: 'personal', title: 'Личные данные', icon: profileIcon, href: '/profile' },
]

export function ProfileMenu({ activeSection }: ProfileMenuProps) {
  return (
    <nav className={styles.menu} aria-label="Разделы личного кабинета">
      <ul className={styles.list}>
        {menuItems.map((item) => (
          <li key={item.id}>
            <Link
              className={`${styles.link} ${activeSection === item.id ? styles.active : ''}`}
              to={item.href}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <img className={styles.icon} src={item.icon} alt="" aria-hidden="true" />
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
