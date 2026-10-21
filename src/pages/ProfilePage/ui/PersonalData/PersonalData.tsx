import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import '@/shared/ui/DatePicker/DatePicker.css'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { CustomDatePicker } from '@/shared/ui/DatePicker/CustomDatePicker'
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
  birthDate: string
  gender: string
  city: string
  aboutMe: string
  avatarUrl?: string
}

interface PersonalDataProps {
  value: PersonalDataValue
  onSave: (value: Pick<PersonalDataValue, 'email' | 'name' | 'aboutMe'>) => void
  onAvatarChange: (avatarUrl: string) => void
}

const genderOptions = [
  { value: 'female', label: 'Женский' },
  { value: 'male', label: 'Мужской' },
  { value: 'unspecified', label: 'Не указан' },
]

const cityOptions = [
  { value: 'moscow', label: 'Москва' },
  { value: 'saint-petersburg', label: 'Санкт-Петербург' },
]

export function PersonalData({ value, onSave, onAvatarChange }: PersonalDataProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState(value.email)
  const [name, setName] = useState(value.name)
  const [aboutMe, setAboutMe] = useState(value.aboutMe)
  const [isSaved, setIsSaved] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [isAvatarUpdated, setIsAvatarUpdated] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({ email: email.trim(), name: name.trim(), aboutMe: aboutMe.trim() })
    setIsSaved(true)
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

  return (
    <section className={styles.section} aria-labelledby="personal-data-title">
      <h1 id="personal-data-title" className={styles.visuallyHidden}>Личные данные</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Почта"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          endIcon={<img src={editIcon} alt="" />}
          onEndIconClick={() => undefined}
        />
        <button className={styles.passwordLink} type="button">Изменить пароль</button>

        <Input
          label="Имя"
          value={name}
          onChange={(event) => setName(event.target.value)}
          endIcon={<img src={editIcon} alt="" />}
          onEndIconClick={() => undefined}
        />

        <div className={styles.row}>
          <div className={styles.dateField}>
            <span className={styles.fieldLabel}>Дата рождения</span>
            <div className={styles.dateControl}>
              <span>{value.birthDate}</span>
              <img src={calendarIcon} alt="" aria-hidden="true" />
              <div className={styles.datePickerOverlay} aria-label="Выбрать дату рождения">
                <CustomDatePicker />
              </div>
            </div>
          </div>

          <Select
            label="Пол"
            options={genderOptions}
            placeholder={value.gender}
            width={200}
          />
        </div>

        <Select
          label="Город"
          options={cityOptions}
          placeholder={value.city}
          width={422}
        />

        <Textarea
          label="О себе"
          value={aboutMe}
          onChange={(event) => setAboutMe(event.target.value)}
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
