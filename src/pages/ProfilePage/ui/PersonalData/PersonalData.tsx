import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import '@/shared/ui/DatePicker/DatePicker.css'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import editIcon from '@/shared/assets/images/edit.svg'
import galleryEditIcon from '@/shared/assets/images/gallery-edit.svg'
import calendarIcon from '@/shared/assets/images/calendar.svg'
import styles from './PersonalData.module.css'

export interface PersonalDataValue {
  email: string
  name: string
  birthDate: string // YYYY-MM-DD
  gender: 'unspecified' | 'male' | 'female'
  city: string // id города
  aboutMe: string
  avatarUrl?: string
}

export interface PersonalDataSubmitValue {
  email: string
  name: string
  birthDate: string
  gender: 'unspecified' | 'male' | 'female'
  city: string
  aboutMe: string
  newPassword?: string
}

interface PersonalDataProps {
  value: PersonalDataValue
  cityOptions: { value: string; label: string }[]
  onSave: (value: PersonalDataSubmitValue) => void
  onAvatarChange: (avatarUrl: string) => void
}

const genderOptions = [
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
  { value: 'unspecified', label: 'Не указан' },
]

export function PersonalData({ value, cityOptions, onSave, onAvatarChange }: PersonalDataProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState(value.email)
  const [name, setName] = useState(value.name)
  const [birthDate, setBirthDate] = useState(value.birthDate)
  const [gender, setGender] = useState<'unspecified' | 'male' | 'female'>(value.gender)
  const [city, setCity] = useState(value.city)
  const [aboutMe, setAboutMe] = useState(value.aboutMe)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [isAvatarUpdated, setIsAvatarUpdated] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError(null)

    if (showPasswordField && newPassword.trim() !== '') {
      if (newPassword.length < 8) {
        setPasswordError('Пароль должен содержать не менее 8 знаков')
        return
      }
      const hasLower = /[a-zа-яё]/.test(newPassword)
      const hasUpper = /[A-ZА-ЯЁ]/.test(newPassword)
      const hasDigit = /\d/.test(newPassword)
      if (!(hasLower && hasUpper && hasDigit)) {
        setPasswordError('Пароль должен содержать цифры, строчные и заглавные буквы')
        return
      }
    }

    const submitValue: PersonalDataSubmitValue = {
      email: email.trim(),
      name: name.trim(),
      aboutMe: aboutMe.trim(),
      birthDate,
      gender,
      city,
    }
    if (newPassword.trim() !== '') {
      submitValue.newPassword = newPassword
    }

    onSave(submitValue)
    setIsSaved(true)
    setNewPassword('')
    setShowPasswordField(false)
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setAvatarError(null)
    setIsAvatarUpdated(false)

    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarError('Можно загружать только изображения JPEG или PNG')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Размер изображения не должен превышать 2 МБ')
      return
    }

    const reader = new FileReader()
    reader.onerror = () => setAvatarError('Не удалось прочитать изображение')
    reader.onload = () => {
      if (typeof reader.result !== 'string') return

      const image = new Image()
      image.onerror = () => setAvatarError('Не удалось обработать изображение')
      image.onload = () => {
        const maxSize = 512
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)

        const context = canvas.getContext('2d')
        if (!context) {
          setAvatarError('Не удалось обработать изображение')
          return
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const avatarUrl = canvas.toDataURL('image/jpeg', 0.82)
        onAvatarChange(avatarUrl)
        setIsAvatarUpdated(true)
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const handleTextChange =
    (setter: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(event.target.value)
      setIsSaved(false)
    }

  return (
    <section className={styles.section} aria-labelledby="personal-data-title">
      <h1 id="personal-data-title" className={styles.visuallyHidden}>Личные данные</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Почта"
          value={email}
          onChange={handleTextChange(setEmail)}
          endIcon={<img src={editIcon} alt="" />}
          onEndIconClick={() => undefined}
        />

        {!showPasswordField && (
          <button
            className={styles.passwordLink}
            type="button"
            onClick={() => {
              setShowPasswordField(true)
              setPasswordError(null)
            }}
          >
            Изменить пароль
          </button>
        )}

        {showPasswordField && (
          <Input
            type="password"
            label="Новый пароль"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setPasswordError(null)
              setIsSaved(false)
            }}
            hint="Оставьте поле пустым, если не хотите менять пароль"
            error={passwordError || undefined}
          />
        )}

        <Input
          label="Имя"
          value={name}
          onChange={handleTextChange(setName)}
          endIcon={<img src={editIcon} alt="" />}
          onEndIconClick={() => undefined}
        />

        <div className={styles.row}>
          <div className={styles.dateField}>
            <span className={styles.fieldLabel}>Дата рождения</span>
            <div className={styles.dateControl}>
              <span>{birthDate.split('-').reverse().join('.')}</span>
              <img src={calendarIcon} alt="" aria-hidden="true" />
              <input
                type="date"
                aria-label="Выбрать дату рождения"
                className={styles.datePickerOverlay}
                style={{ opacity: 0, cursor: 'pointer' }}
                value={birthDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  setBirthDate(e.target.value)
                  setIsSaved(false)
                }}
              />
            </div>
          </div>

          <div style={{ position: 'relative', width: 200 }}>
            <Select
              label="Пол"
              options={genderOptions}
              placeholder={genderOptions.find(o => o.value === gender)?.label || ''}
              width={200}
            />
            <select
              aria-label="Пол"
              value={gender}
              onChange={(e) => {
                setGender(e.target.value as 'unspecified' | 'male' | 'female')
                setIsSaved(false)
              }}
              style={{
                position: 'absolute',
                top: 28,
                height: 48,
                width: 200,
                opacity: 0,
                cursor: 'pointer',
              }}
            >
              {genderOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ position: 'relative', width: 422 }}>
          <Select
            label="Город"
            options={cityOptions}
            placeholder={cityOptions.find(o => o.value === city)?.label || ''}
            width={422}
          />
          <select
            aria-label="Город"
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              setIsSaved(false)
            }}
            style={{
              position: 'absolute',
              top: 28,
              height: 48,
              width: 422,
              opacity: 0,
              cursor: 'pointer',
            }}
          >
            {cityOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <Textarea
          label="О себе"
          value={aboutMe}
          onChange={handleTextChange(setAboutMe)}
          showPostfix
        />

        <Button className={styles.saveButton} type="submit">Сохранить</Button>
        {isSaved && <p className={styles.savedMessage} role="status">Данные сохранены</p>}
      </form>

      <div className={styles.avatarArea}>
        <Avatar
          src={value.avatarUrl}
          alt={`Аватар пользователя ${value.name}`}
          size="big"
        />
        <button
          className={styles.avatarButton}
          type="button"
          aria-label="Изменить аватар"
          title="Выбрать новый аватар"
          onClick={() => avatarInputRef.current?.click()}
        >
          <img src={galleryEditIcon} alt="" aria-hidden="true" />
        </button>
        <input
          id="profile-avatar-input"
          ref={avatarInputRef}
          className={styles.visuallyHidden}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleAvatarChange}
          aria-label="Выбрать новый аватар"
        />
        {avatarError && <p className={styles.avatarError} role="alert">{avatarError}</p>}
        {isAvatarUpdated && !avatarError && (
          <p className={styles.avatarSuccess} role="status">Аватар обновлён</p>
        )}
      </div>
    </section>
  )
}
