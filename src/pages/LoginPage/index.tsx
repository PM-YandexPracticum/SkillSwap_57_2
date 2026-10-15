import { useEffect, useState, type ChangeEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import authIdea from '@/shared/assets/images/auth-idea.svg'
import crossIcon from '@/shared/assets/images/cross.svg'
import { INVALID_CREDENTIALS_MESSAGE, login } from '@/features/auth/model/authSlice'
import { ROUTES } from '@/shared/lib/constants'
import { useAppDispatch } from '@/store/hooks'
import { Button } from '@/shared/ui/Button'
import { AuthInfoCard } from '@/shared/ui/Form/AuthInfoCard'
import { CorpsButton } from '@/shared/ui/Form/CorpsButton'
import { Input } from '@/shared/ui/Input'
import { Logo } from '@/shared/ui/logo'
import styles from './LoginPage.module.css'

/** Флаг в localStorage о предыдущем визите на страницу входа. */
const LOGIN_VISIT_KEY = 'skillswap_login_visited'

const loginSchema = yup.object({
  email: yup.string().trim().required('Введите email').email('Введите корректный email'),
  password: yup.string().required('Введите пароль'),
})

type LoginFormValues = yup.InferType<typeof loginSchema>

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
  const location = useLocation()
  const dispatch = useAppDispatch()

  const [hasCredentialsError, setHasCredentialsError] = useState(false)

  // «С возвращением» показываем, если поля уже заполняли (isDirty) или
  // если пользователь заходил на страницу раньше (флаг в localStorage).
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false)

  // Куда вернуться после входа (по умолчанию — главная).
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? ROUTES.HOME

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (localStorage.getItem(LOGIN_VISIT_KEY)) {
      setHasVisitedBefore(true)
    }
  }, [])

  const isReturning = isDirty || hasVisitedBefore
  const card = isReturning ? RETURNING_CARD : DEFAULT_CARD

  const clearCredentialsError = () => {
    if (!hasCredentialsError) return
    setHasCredentialsError(false)
    clearErrors('password')
  }

  const emailField = register('email')
  const passwordField = register('password')

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearCredentialsError()
    emailField.onChange(event)
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearCredentialsError()
    passwordField.onChange(event)
  }

  const onSubmit = async (values: LoginFormValues) => {
    // Фиксируем визит: при следующем заходе покажем «С возвращением».
    localStorage.setItem(LOGIN_VISIT_KEY, 'true')
    setHasVisitedBefore(true)

    const result = await dispatch(login(values))

    if (login.fulfilled.match(result)) {
      navigate(from, { replace: true })
      return
    }

    // Неверные данные: подсвечиваем оба поля и показываем сообщение под паролем.
    setHasCredentialsError(true)
    setError('password', {
      type: 'server',
      message: result.payload ?? INVALID_CREDENTIALS_MESSAGE,
    })
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
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <CorpsButton />

            <div className={styles.fields}>
              <Input
                {...emailField}
                type="email"
                autoComplete="email"
                placeholder="Email"
                aria-label="Email"
                error={errors.email?.message}
                className={hasCredentialsError ? styles.credentialsError : undefined}
                onChange={handleEmailChange}
                disabled={isSubmitting}
              />

              <Input
                {...passwordField}
                type="password"
                autoComplete="current-password"
                placeholder="Пароль"
                aria-label="Пароль"
                error={errors.password?.message}
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
