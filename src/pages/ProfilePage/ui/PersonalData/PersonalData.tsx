import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { format, isValid, parse, parseISO } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'
import '@/shared/ui/DatePicker/DatePicker.css'
import type { City, User } from '@/shared/types'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { CustomDatePicker } from '@/shared/ui/DatePicker/CustomDatePicker'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import editIcon from '@/shared/assets/images/edit.svg'
import galleryEditIcon from '@/shared/assets/images/gallery-edit.svg'
import styles from './PersonalData.module.css'

interface PersonalDataProps {
  value: User
  cities: City[]
  onSave: (user: User, password?: string) => void
}

const genderOptions = [
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
  { value: 'unspecified', label: 'Не указан' },
]

const SAVE_ERROR_MESSAGE =
  'Не удалось сохранить данные. Проверьте доступное место в браузере и попробуйте ещё раз.'

function readAvatar(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    return Promise.reject(new Error('Выберите изображение JPEG или PNG размером до 2 МБ'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение'))
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Не удалось прочитать изображение'))
    reader.readAsDataURL(file)
  })
}

export function PersonalData({ value, cities, onSave }: PersonalDataProps) {
  const [email, setEmail] = useState(value.email)
  const [name, setName] = useState(value.name)
  const [birthDate, setBirthDate] = useState<Date | null>(value.birthDate ? parseISO(value.birthDate) : null)
  const [invalidDateInput, setInvalidDateInput] = useState(false)
  const [gender, setGender] = useState<User['gender']>(value.gender)
  const [city, setCity] = useState(value.city)
  const [aboutMe, setAboutMe] = useState(value.aboutMe)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(value.avatar)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const avatarInput = useRef<HTMLInputElement>(null)

  const handleAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setMessage(null)
    try {
      setAvatar(await readAvatar(file))
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Не удалось прочитать изображение' })
    }
    event.target.value = ''
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Введите ваше имя' })
      return
    }
    if (invalidDateInput || (birthDate && (!isValid(birthDate) || birthDate > new Date()))) {
      setMessage({ type: 'error', text: 'Введите корректную дату рождения' })
      return
    }
    setSaving(true)
    try {
      onSave({
        ...value,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        birthDate: birthDate ? format(birthDate, 'yyyy-MM-dd') : '',
        gender,
        city,
        aboutMe,
        avatar,
      }, password || undefined)
      setPassword('')
      setMessage({ type: 'success', text: 'Данные сохранены' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error && error.message === 'Пользователь с таким email уже зарегистрирован'
          ? error.message
          : SAVE_ERROR_MESSAGE,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={styles.section} aria-labelledby="personal-data-title">
      <h1 id="personal-data-title" className={styles.visuallyHidden}>Личные данные</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input type="email" label="Почта" value={email} required
          onChange={(event) => { setEmail(event.target.value); setMessage(null) }}
          endIcon={<img src={editIcon} alt="" />} />
        <button className={styles.passwordLink} type="button"
          onClick={() => setShowPassword((current) => !current)}>Изменить пароль</button>
        {showPassword && <Input type="password" label="Новый пароль" value={password}
          onChange={(event) => { setPassword(event.target.value); setMessage(null) }} />}
        <Input label="Имя" value={name} required
          onChange={(event) => { setName(event.target.value); setMessage(null) }}
          endIcon={<img src={editIcon} alt="" />} />
        <div className={styles.row}>
          <div className={styles.dateField}>
            <span className={styles.fieldLabel}>Дата рождения</span>
            <CustomDatePicker selected={birthDate} strictParsing onChange={(date: Date | null) => {
              setBirthDate(date)
              setInvalidDateInput(false)
              setMessage(null)
            }} onInputError={() => setInvalidDateInput(true)}
              onChangeRaw={(event) => {
                if (!(event?.target instanceof HTMLInputElement)) return
                const text = event.target.value
                const parsed = parse(text, 'dd.MM.yyyy', new Date())
                setInvalidDateInput(Boolean(text &&
                  (!isValid(parsed) || format(parsed, 'dd.MM.yyyy') !== text || parsed > new Date())))
              }} maxDate={new Date()} aria-label="Дата рождения" />
          </div>
          <Select label="Пол" options={genderOptions} placeholder="Не указан"
            value={gender} onChange={(next) => { setGender(next as User['gender']); setMessage(null) }} width={200} />
        </div>
        <Select label="Город" options={cities.map((item) => ({ value: item.id, label: item.title }))}
          placeholder="Не указан" value={city}
          onChange={(next) => { setCity(next as string); setMessage(null) }} width={422} />
        <Textarea label="О себе" value={aboutMe}
          onChange={(event) => { setAboutMe(event.target.value); setMessage(null) }} showPostfix />
        <Button className={styles.saveButton} type="submit" disabled={saving}>Сохранить</Button>
        {message && <p className={message.type === 'error' ? styles.errorMessage : styles.savedMessage}
          role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>}
      </form>
      <div className={styles.avatarArea}>
        <Avatar src={avatar ?? undefined} alt={`Аватар пользователя ${name}`} size="big" />
        <input ref={avatarInput} className={styles.visuallyHidden} type="file"
          accept="image/jpeg,image/png" aria-label="Выбрать аватар" onChange={handleAvatar} />
        <button className={styles.avatarButton} type="button" aria-label="Изменить аватар"
          onClick={() => avatarInput.current?.click()}>
          <img src={galleryEditIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
