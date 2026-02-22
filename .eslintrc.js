module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    node: true,
    es2022: true
  },
  rules: {
    // Standard JS - No semicolons
    'semi': ['error', 'never'],
    '@typescript-eslint/semi': ['error', 'never'],
    
    // Standard JS - 2 space indentation
    'indent': ['error', 2, { SwitchCase: 1 }],
    '@typescript-eslint/indent': ['error', 2, { SwitchCase: 1 }],
    
    // Standard JS - Single quotes
    'quotes': ['error', 'single', { avoidEscape: true }],
    '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
    
    // Standard JS - Space before function parenthesis
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    
    // Standard JS - No trailing spaces
    'no-trailing-spaces': 'error',
    
    // Standard JS - Comma spacing
    'comma-spacing': ['error', { before: false, after: true }],
    
    // Standard JS - Key spacing
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    
    // Standard JS - Object curly spacing
    'object-curly-spacing': ['error', 'always'],
    
    // Standard JS - Array bracket spacing
    'array-bracket-spacing': ['error', 'never'],
    
    // Standard JS - Arrow spacing
    'arrow-spacing': ['error', { before: true, after: true }],
    
    // Standard JS - No multiple empty lines
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    
    // TypeScript specific
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: {
        delimiter: 'none',
        requireLast: false
      },
      singleline: {
        delimiter: 'comma',
        requireLast: false
      }
    }],
    
    // General
    'no-console': 'off',
    'eol-last': ['error', 'always']
  }
}
