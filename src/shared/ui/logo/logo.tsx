import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants'
import logoImg from '../../../assets/images/logo.svg'
import styles from './logo.module.css'

export const Logo = () => (
  <Link className={styles.logoLink} to={ROUTES.HOME}>
    <img className={styles.logo} src={logoImg} alt="логотип сайта" />
    <h1 className={styles.title}>SkillSwap</h1>
  </Link>
)