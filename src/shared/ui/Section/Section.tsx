import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Title } from '../Title'
import { LookAllButton } from '../LookAllButton'

import styles from './Section.module.scss'

interface SectionProps {
  title: string
  children: ReactNode[]
  showLookAllButton?: boolean
}

export const Section = ({ title, children, showLookAllButton = true }: SectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(showLookAllButton ? 3 : 9)
  const [isLoading, setIsLoading] = useState(false)

  const loaderRef = useRef<HTMLDivElement>(null)

  const displayedCards = showLookAllButton
    ? children.slice(0, isExpanded ? 6 : 3)
    : children.slice(0, visibleCount)

  const hasMore = !showLookAllButton && visibleCount < children.length

  useEffect(() => {
    if (showLookAllButton || !hasMore || isLoading) return

    const loader = loaderRef.current

    if (!loader) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoading(true)
        }
      },
      { rootMargin: '100px' },
    )

    observer.observe(loader)

    return () => observer.disconnect()
  }, [showLookAllButton, hasMore, isLoading])

  useEffect(() => {
    if (!isLoading) return

    const timeout = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 6, children.length))
      setIsLoading(false)
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [isLoading, children.length])

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Title size="H2">{title}</Title>

        {showLookAllButton && (
          <LookAllButton isExpanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)} />
        )}
      </div>

      <div className={styles.grid}>{displayedCards}</div>

      {hasMore && (
        <div ref={loaderRef} className={styles.loader}>
          {isLoading && (
            <svg
              className={styles.spinner}
              viewBox="0 0 24 24"
              aria-label="Загрузка карточек"
              role="status"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="40 16"
              />
            </svg>
          )}
        </div>
      )}
    </section>
  )
}
