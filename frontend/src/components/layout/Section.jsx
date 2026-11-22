import styles from './Section.module.css'

export default function Section({ id, title, description, children }) {
  const headingId = `${id}-heading`
  return (
    <section id={id} className={styles.section} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {children}
    </section>
  )
}
