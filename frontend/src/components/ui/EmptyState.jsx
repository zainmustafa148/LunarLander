import styles from './EmptyState.module.css'

export default function EmptyState({ icon: Icon, title, children }) {
  return (
    <section className={styles.card} aria-label={title}>
      {Icon && (
        <span className={styles.icon}>
          <Icon size={24} aria-hidden="true" />
        </span>
      )}
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
