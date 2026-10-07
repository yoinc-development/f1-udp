import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'out/**',
            'release/**',
            'target/**',
            'src/main/java/**',
            'src/main/resources/**'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/main/**/*.ts', 'src/preload/**/*.ts', 'src/shared/**/*.ts', '*.config.ts'],
        languageOptions: {globals: globals.node}
    },
    {
        files: ['src/renderer/**/*.{ts,tsx}'],
        languageOptions: {globals: globals.browser},
        plugins: {'react-hooks': reactHooks},
        rules: reactHooks.configs.recommended.rules
    },
    prettier
)
