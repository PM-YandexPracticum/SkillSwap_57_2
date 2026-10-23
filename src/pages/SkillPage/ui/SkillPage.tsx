import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { loadCities } from '@/entities/city/model/citiesSlice'
import { fetchSkills } from '@/entities/skill/model/skillsSlice'
import { fetchUsers } from '@/entities/user/model/usersSlice'
import {
  addFavorite,
  removeFavorite,
  selectFavoriteIds,
} from '@/features/favorites/model/favoritesSlice'
import { ROUTES } from '@/shared/lib/constants'
import { getSkillPath } from '@/shared/lib/helpers'
import { getInterestSkillItems, toSkillItems } from '@/shared/lib/subcategories'
import { Card } from '@/shared/ui/Card'
import { CardCarousel } from '@/shared/ui/CardCarousel'
import { LikeButton } from '@/shared/ui/LikeButton'
import { Person } from '@/shared/ui/Person'
import { SkillDetails } from '@/shared/ui/SkillDetails'
import { SkillsList } from '@/shared/ui/SkillsList'
import SkillCategoryGroupList from '@/shared/ui/SkillCategoryGroupList/SkillCategoryGroupList'
import { Title } from '@/shared/ui/Title'
import moreIcon from '@/shared/assets/images/more-square.svg'
import shareIcon from '@/shared/assets/images/share.svg'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './SkillPage.module.css'
import { useRequireAuth } from '@/features/auth/model/useRequireAuth'
import { selectCurrentUser } from '@/features/auth/model/authSelectors'
import { addExchangeNotification } from '@/features/notifications/model/notificationsSlice'
import { Modal } from '@/shared/ui/Modal/Modal'
import { SuccessMessage } from '@/shared/ui/SuccessMessage'
import notificationHug from '@/shared/assets/images/notification-hug.svg'

const SkillOfferPage = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const authorId = searchParams.get('author')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { requireAuth } = useRequireAuth()

  const skills = useAppSelector((state) => state.skills.items)
  const skillsStatus = useAppSelector((state) => state.skills.status)
  const users = useAppSelector((state) => state.users.items)
  const usersStatus = useAppSelector((state) => state.users.status)
  const cities = useAppSelector((state) => state.cities.items)
  const currentUser = useAppSelector(selectCurrentUser)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const favoriteIds = useAppSelector(selectFavoriteIds)

  // При прямом заходе по URL стор пустой, поэтому справочники загружаем сами.
  useEffect(() => {
    if (skillsStatus === 'idle') void dispatch(fetchSkills())
    if (usersStatus === 'idle') void dispatch(fetchUsers())
    if (cities.length === 0) void dispatch(loadCities())
  }, [cities.length, dispatch, skillsStatus, usersStatus])

  const skill = useMemo(() => skills.find((item) => item.id === id), [id, skills])

  // Один навык могут преподавать несколько человек: автора берём из ссылки.
  // Если author указан явно, другого преподавателя не подставляем.
  const author = useMemo(() => {
    if (!skill) return undefined

    const authors = users.filter((user) => user.teach.includes(skill.id))
    return authorId ? authors.find((user) => user.id === authorId) : authors[0]
  }, [authorId, skill, users])

  const similarCards = useMemo(() => {
    if (!skill) return []

    return skills
      .filter((item) => item.category === skill.category && item.id !== skill.id)
      .flatMap((item) => {
        const cardUser = users.find((user) => user.teach.includes(item.id))
        return cardUser ? [{ skill: item, user: cardUser }] : []
      })
  }, [skill, skills, users])

  const toggleFavorite = useCallback(
    (cardId: string, isLiked: boolean) => {
      dispatch(isLiked ? addFavorite(cardId) : removeFavorite(cardId))
    },
    [dispatch],
  )

  // Карточка в избранном — это автор, поэтому лайк привязан только к id пользователя.
  const favoriteId = author?.id
  const isFavorite = favoriteId ? favoriteIds.includes(favoriteId) : false
  const handleFavoriteChange = (isLiked: boolean) => {
    if (favoriteId) toggleFavorite(favoriteId, isLiked)
  }

  const handleShare = () => {
    void navigator.clipboard?.writeText(window.location.href).catch(() => {})
  }
  const handleExchange = () => {
    if (!skill || !author || !currentUser) return

    dispatch(addExchangeNotification(skill.id, author.id, author.name))
    setIsSuccessModalOpen(true)
  }
  const isSkillLoading = skillsStatus === 'idle' || skillsStatus === 'loading'
  const isAuthorLoading = usersStatus === 'idle' || usersStatus === 'loading'

  if (skillsStatus === 'failed') {
    return (
      <main className={styles.page}>
        <p className={styles.error} role="alert">
          Не удалось загрузить навык. Попробуйте обновить страницу.
        </p>
      </main>
    )
  }

  if (isSkillLoading || (isAuthorLoading && !author)) {
    return (
      <main className={styles.page}>
        <p className={styles.message} role="status">
          Загрузка…
        </p>
      </main>
    )
  }

  if (!skill) {
    return (
      <main className={styles.page}>
        <Title size="H2">Навык не найден</Title>
        <p className={styles.message}>Возможно, предложение удалили или ссылка устарела.</p>
        <Link className={styles.link} to={ROUTES.HOME}>
          Вернуться в каталог
        </Link>
      </main>
    )
  }

  // author указан явно, но этот пользователь не преподаёт навык:
  // другого автора не подставляем, предложение считаем ненайденным.
  if (authorId && !author) {
    return (
      <main className={styles.page}>
        <Title size="H2">Предложение не найдено</Title>
        <p className={styles.message}>
          Возможно, автор больше не преподаёт этот навык или ссылка устарела.
        </p>
        <Link className={styles.link} to={ROUTES.HOME}>
          Вернуться в каталог
        </Link>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <aside className={styles.author}>
          {author ? (
            <>
              <Person user={author} />

              <section className={styles.about}>
                <Title size="H4">О себе</Title>
                <p className={styles.aboutText}>{author.aboutMe}</p>
              </section>

              <SkillsList title="Может научить:" skills={toSkillItems(author.teach, skills)} />
              <SkillsList
                title="Хочет научиться:"
                skills={getInterestSkillItems(author, skills)}
              />
            </>
          ) : (
            <p className={styles.message}>Автор не найден</p>
          )}
        </aside>

        <div className={styles.skillColumn}>
          <div className={styles.toolbar}>
            {favoriteId && (
              <LikeButton
                checked={isFavorite}
                onChange={(event) => handleFavoriteChange(event.target.checked)}
                aria-label="Добавить в избранное"
              />
            )}

            <button
              className={styles.iconButton}
              type="button"
              aria-label="Поделиться"
              onClick={handleShare}
            >
              <img src={shareIcon} alt="" aria-hidden="true" />
            </button>

            <button className={styles.iconButton} type="button" aria-label="Ещё">
              <img src={moreIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          <SkillDetails
            title={skill.title}
            category={skill.category}
            subcategory={skill.subcategory}
            description={skill.description}
            images={skill.images}
            variant="skill"
            // TODO: создание заявки на обмен — отдельная задача, обработчик подключается позже
            onExchange={() => {
              if (requireAuth()) handleExchange()
            }}
          />
        </div>
      </div>

      {similarCards.length > 0 && (
        <CardCarousel>
          {similarCards.map(({ skill: similarSkill, user: cardUser }) => (
            <Card
              key={similarSkill.id}
              user={cardUser}
              teach={toSkillItems(cardUser.teach, skills)}
              learn={getInterestSkillItems(cardUser, skills)}
              isLiked={favoriteIds.includes(cardUser.id)}
              onLikeChange={(isLiked) => toggleFavorite(cardUser.id, isLiked)}
              onDetailsClick={() => navigate(getSkillPath(similarSkill.id, cardUser.id))}
            />
          ))}
        </CardCarousel>
      )}
      {isSuccessModalOpen && (
        <Modal
          onClose={() => setIsSuccessModalOpen(false)}
          onOverlayClick={() => setIsSuccessModalOpen(false)}
        >
          <SuccessMessage
            variant="exchange"
            illustration={notificationHug}
            title="Вы предложили обмен"
            description="Теперь дождитесь подтверждения. Вам придёт уведомление"
            onClose={() => setIsSuccessModalOpen(false)}
          />
        </Modal>
      )}
    </main>
  )
}

const SkillPage = () => {
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (!id) window.scrollTo(0, 0)
  }, [id])

  if (id) return <SkillOfferPage />

  return (
    <main className={styles.page} aria-labelledby="all-skills-title">
      <Title size="H1" id="all-skills-title">
        Все навыки
      </Title>
      <SkillCategoryGroupList className={styles.categories} linked={false} />
    </main>
  )
}

export default SkillPage
