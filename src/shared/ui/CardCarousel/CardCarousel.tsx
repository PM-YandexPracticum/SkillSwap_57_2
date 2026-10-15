import { Children, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import ChevronRight from '@/shared/assets/images/chevron-right.svg'

import styles from './CardCarousel.module.scss'

interface CardCarouselProps {
  children: ReactNode
  title?: string
}

export const CardCarousel = ({ children, title = 'Похожие предложения' }: CardCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return

    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    updateScrollButtons()

    emblaApi.on('select', updateScrollButtons)
    emblaApi.on('reInit', updateScrollButtons)

    return () => {
      emblaApi.off('select', updateScrollButtons)
      emblaApi.off('reInit', updateScrollButtons)
    }
  }, [emblaApi, updateScrollButtons])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  return (
    <section className={styles.carousel} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.carouselWrapper}>
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.container}>
            {Children.toArray(children).map((child, index) => (
              <div className={styles.slide} key={index}>
                {child}
              </div>
            ))}
          </div>
        </div>

        {canScrollPrev && (
          <button
            className={`${styles.arrow} ${styles.arrowPrev}`}
            type="button"
            onClick={scrollPrev}
            aria-label="Предыдущие предложения"
          >
            <img src={ChevronRight} alt="" className={styles.chevronLeft} />
          </button>
        )}

        {canScrollNext && (
          <button
            className={`${styles.arrow} ${styles.arrowNext}`}
            type="button"
            onClick={scrollNext}
            aria-label="Следующие предложения"
          >
            <img src={ChevronRight} alt="" className={styles.chevronRight} />
          </button>
        )}
      </div>
    </section>
  )
}
