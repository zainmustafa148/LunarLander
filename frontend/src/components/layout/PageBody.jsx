import styles from './PageBody.module.css'

// Wraps a page's content so every page uses the same compact body size as the Overview.
export default function PageBody({ children }) {
  return <div className={styles.body}>{children}</div>
}
