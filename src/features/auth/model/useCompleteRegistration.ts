import { useRef, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { registerUser, type RegistrationData } from './registerUser'

/** Подключается к onDone предпросмотра; состояние формы остаётся в родителе. */
export function useCompleteRegistration() {
  const dispatch = useAppDispatch()
  const busy = useRef(false)
  const completed = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const complete = async (data: RegistrationData) => {
    if (busy.current || completed.current) return
    busy.current = true
    setIsSubmitting(true)
    setError(null)
    try {
      await dispatch(registerUser(data)).unwrap()
      completed.current = true
      setIsSuccessOpen(true)
    } catch (reason) {
      setError(typeof reason === 'string' ? reason : 'Не удалось завершить регистрацию')
    } finally {
      busy.current = false
      setIsSubmitting(false)
    }
  }

  return {
    complete,
    isSubmitting,
    error,
    isSuccessOpen,
    closeSuccess: () => setIsSuccessOpen(false),
  }
}
