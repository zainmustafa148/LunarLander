import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import { NAV_ITEMS } from '../../app/navigation.js'
import styles from './ExploreSection.module.css'

// Links to the other six sections, from the single navigation list.
export default function ExploreSection() {
  return (
    <ul className={styles.grid}>
      {NAV_ITEMS.filter((item) => item.path !== '/').map(({ path, label, description, icon: Icon }) => (
        <li key={path}>
          <Card className={styles.card}>
            <Icon size={20} aria-hidden="true" className={styles.icon} />
            <h3 className={styles.title}>
              <Link to={path} className={styles.link}>
                {label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </h3>
            <p className={styles.text}>{description}</p>
          </Card>
        </li>
      ))}
    </ul>
  )
}
