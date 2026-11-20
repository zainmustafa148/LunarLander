import clsx from 'clsx'
import styles from './Card.module.css'

export default function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={clsx(styles.card, className)} {...props}>
      {children}
    </Tag>
  )
}
