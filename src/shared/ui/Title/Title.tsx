import { PropsWithChildren, HTMLAttributes, FC, createElement } from 'react'
import styles from './Title.module.css'

export type TitleSize = 'H1' | 'H2' | 'H3' | 'H4'

export type TitleProps = PropsWithChildren<
  HTMLAttributes<HTMLHeadingElement> & {
    size: TitleSize
  }
>

const headingTags = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
} as const

export const Title: FC<TitleProps> = ({ className, size, ...rest }) => {
  const tag = headingTags[size]

  const titleClassName = [styles.title, styles[size], className].filter(Boolean).join(' ')

  // чтобы не было копипасты используется headingTags
  const title = createElement(tag, { className: titleClassName, ...rest })

  return title
}
