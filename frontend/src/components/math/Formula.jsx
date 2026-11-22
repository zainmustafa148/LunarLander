import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import styles from './Formula.module.css'

/*
 * Renders a TeX formula with KaTeX. `label` is a plain-language reading for screen readers.
 * Block formulas scroll horizontally on narrow screens instead of overflowing the page.
 */
export default function Formula({ tex, label, block = true }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: block, throwOnError: false, output: 'htmlAndMathml' }),
    [tex, block],
  )
  if (!block) {
    // KaTeX output is generated from the project's own formula strings, never from user input.
    return <span className={styles.inline} role="math" aria-label={label} dangerouslySetInnerHTML={{ __html: html }} />
  }
  return (
    // Scrollable region: keyboard focusable so narrow screens can scroll long formulas.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={styles.block} role="math" aria-label={label} tabIndex={0}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
