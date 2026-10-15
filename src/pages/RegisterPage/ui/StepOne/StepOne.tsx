import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { isEmailTaken } from '@/api/users'
import { ROUTES } from '@/shared/lib/constants'
import { Button } from '@/shared/ui/Button'
import { CorpsButton } from '@/shared/ui/Form/CorpsButton'
import { Input } from '@/shared/ui/Input'

import styles from './StepOne.module.css'
import type { StepOneValue } from './model'

interface StepOneProps {
  value: StepOneValue
  onChange: (value: StepOneValue) => void
  onContinue: (value: StepOneValue) => void
}

export function StepOne({ value, onChange, onContinue }: StepOneProps) {
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const password = value.password

  const isPasswordStrong =
    password.length >= 8 &&
    /[a-zа-яё]/.test(password) &&
    /[A-ZА-ЯЁ]/.test(password) &&
    /\d/.test(password)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setEmailError('')
    setPasswordError('')
    setFormError('')

    const email = value.email.trim()
    const password = value.password

    let hasErrors = false

    if (!email) {
      setEmailError('Введите email')
      hasErrors = true
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Введите корректный email')
      hasErrors = true
    }

    if (!password) {
      setPasswordError('Введите пароль')
      hasErrors = true
    } else if (password.length < 8) {
      setPasswordError('Пароль должен содержать не менее 8 знаков')
      hasErrors = true
    } else if (!isPasswordStrong) {
      setPasswordError('Пароль должен содержать цифры, строчные и заглавные буквы')
      hasErrors = true
    }

    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsSubmitting(true)

      try {
        const emailTaken = await isEmailTaken(email)

        if (emailTaken) {
          setEmailError('Этот email уже используется')
          hasErrors = true
        }
      } catch {
        setFormError('Не удалось проверить email. Попробуйте ещё раз.')
        return
      } finally {
        setIsSubmitting(false)
      }
    }

    if (hasErrors) {
      return
    }

    onContinue({
      ...value,
      email,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <CorpsButton />

      <div className={styles.inputContainer}>
        <Input
          label="Email"
          type="email"
          placeholder="Введите email"
          value={value.email}
          onChange={(event) => {
            onChange({
              ...value,
              email: event.target.value,
            })
            setEmailError('')
            setFormError('')
          }}
          error={emailError}
        />

        <div className={styles.inputPassword}>
          <Input
            label="Пароль"
            type="password"
            placeholder="Придумайте надёжный пароль"
            value={value.password}
            onChange={(event) => {
              onChange({
                ...value,
                password: event.target.value,
              })
              setPasswordError('')
              setFormError('')
            }}
            error={passwordError}
          />

          {!password ? (
            <span className={styles.tip}>Пароль должен содержать не менее 8 знаков</span>
          ) : password.length < 8 ? (
            <span className={styles.tip}>Осталось ввести ещё {8 - password.length} символов</span>
          ) : isPasswordStrong ? (
            <span className={`${styles.tip} ${styles.passwordStrong}`}>Надёжный</span>
          ) : passwordError ? null : (
            <span className={`${styles.tip} ${styles.passwordWeak}`}>Ненадёжный</span>
          )}
        </div>
      </div>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <div className={styles.nextAuthoStep}>
        <Button type="submit" className={styles.nextButton} disabled={isSubmitting}>
          Далее
        </Button>

        <p className={styles.signIn}>
          Уже есть аккаунт? <Link to={ROUTES.LOGIN}>Войти</Link>
        </p>
      </div>
    </form>
  )
}
