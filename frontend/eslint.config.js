import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11yX from 'eslint-plugin-jsx-a11y-x'
import { defineConfig, globalIgnores } from 'eslint/config'

// eslint-plugin-jsx-a11y only supports ESLint up to v9, so this project uses eslint-plugin-jsx-a11y-x,
// the maintained fork with the same rules and an ESLint 9 / 10 peer range. Its recommended rules are
// registered under the original `jsx-a11y/` prefix, so existing `eslint-disable jsx-a11y/...`
// comments in the code keep working.
const a11yRules = Object.fromEntries(
  Object.entries(jsxA11yX.configs.recommended.rules).map(([name, setting]) => [
    name.replace(/^jsx-a11y-x\//, 'jsx-a11y/'),
    setting,
  ]),
)

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    plugins: { 'jsx-a11y': jsxA11yX },
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: a11yRules,
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])