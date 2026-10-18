import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants'
import notFoundImage from '@/shared/assets/images/error-404.svg'
import { Button } from '@/shared/ui/Button/Button'
import { Footer } from '@/shared/ui/Footer/Footer'
import { Header } from '@/shared/ui/Header/Header'
import { Title } from '@/shared/ui/Title'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <img
            src={notFoundImage}
            alt='Ошибка 404'
            width={460}
            height={304}
            className={styles.illustration}
          />
          <div className={styles.text}>
            <Title size='H2' className={styles.title}>
              Страница не найдена
            </Title>
            <p className={styles.description}>
              К сожалению, эта страница недоступна. Вернитесь на главную страницу или попробуйте
              позже
            </p>
          </div>
          <div className={styles.buttons}>
            <Button variant='secondary' className={styles.button}>
              Сообщить об ошибке
            </Button>
            <Button className={styles.button} onClick={() => navigate(ROUTES.HOME)}>
              На главную
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}