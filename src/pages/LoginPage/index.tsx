import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authIdea from '@/shared/assets/images/auth-idea.svg'
import crossIcon from '@/shared/assets/images/cross.svg'
import { ROUTES } from '@/shared/lib/constants'
import { Button } from '@/shared/ui/Button'
import { AuthInfoCard } from '@/shared/ui/Form/AuthInfoCard'
import { CorpsButton } from '@/shared/ui/Form/CorpsButton'
import { Input } from '@/shared/ui/Input'
import { Logo } from '@/shared/ui/logo'
import { INVALID_CREDENTIALS_MESSAGE, mockLogin } from './mockAuth'
import styles from './LoginPage.module.css'

/** Флаг в localStorage о предыдущем визите на страницу входа. */
const LOGIN_VISIT_KEY = 'skillswap_login_visited'

/** Простая проверка формата email. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DEFAULT_CARD = {
  title: 'Добро пожаловать в SkillSwap!',
  description: 'Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми',
}

const RETURNING_CARD = {
  title: 'С возвращением в SkillSwap!',
  description: 'Обменивайтесь знаниями и навыками с другими людьми',
}

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [hasCredentialsError, setHasCredentialsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // «С возвращением» показываем, если поля уже заполняли (isDirty) или
  // если пользователь заходил на страницу раньше (флаг в localStorage).
  const [isDirty, setIsDirty] = useState(false)
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(LOGIN_VISIT_KEY)) {
      setHasVisitedBefore(true)
    }
  }, [])

  const isReturning = isDirty || hasVisitedBefore
  const card = isReturning ? RETURNING_CARD : DEFAULT_CARD

  const resetErrors = () => {
    setEmailError('')
    setPasswordError('')
    setHasCredentialsError(false)
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    setIsDirty(true)
    resetErrors()
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
    setIsDirty(true)
    resetErrors()
  }

  const validate = () => {
    const trimmedEmail = email.trim()
    let isValid = true

    if (!trimmedEmail) {
      setEmailError('Введите email')
      isValid = false
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError('Введите корректный email')
      isValid = false
    }

    if (!password) {
      setPasswordError('Введите пароль')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) return

    // Фиксируем визит: при следующем заходе покажем «С возвращением».
    localStorage.setItem(LOGIN_VISIT_KEY, 'true')
    setHasVisitedBefore(true)

    setIsSubmitting(true)
    try {
      await mockLogin(email.trim(), password)
      navigate(ROUTES.HOME)
    } catch {
      // Заглушка вернула ошибку авторизации: подсвечиваем оба поля
      // и показываем сообщение под полем пароля.
      setHasCredentialsError(true)
      setPasswordError(INVALID_CREDENTIALS_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <Link className={styles.closeButton} to={ROUTES.HOME}>
          <span className={styles.closeText}>Закрыть</span>
          <img src={crossIcon} alt="" aria-hidden="true" />
        </Link>
      </header>

      <div className={styles.container}>
        <section className={styles.formColumn}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <CorpsButton />

            <div className={styles.fields}>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                aria-label="Email"
                value={email}
                error={emailError}
                className={hasCredentialsError ? styles.credentialsError : undefined}
                onChange={handleEmailChange}
                disabled={isSubmitting}
              />

              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Пароль"
                aria-label="Пароль"
                value={password}
                error={passwordError}
                onChange={handlePasswordChange}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.actions}>
              <Button type="submit" className={styles.submit} disabled={isSubmitting}>
                Войти
              </Button>

              <Link className={styles.registerButton} to={ROUTES.REGISTER}>
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </section>

        <section className={styles.infoColumn}>
          <AuthInfoCard illustration={authIdea} title={card.title} description={card.description} />
        </section>
      </div>
    </main>
  )
}
