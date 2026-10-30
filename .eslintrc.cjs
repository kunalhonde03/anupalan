module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
        message: "ANUPALAN Invariant 2 Violation: Calling Date.now() directly is strictly forbidden. All time MUST come from clock.now() in packages/engine."
      },
      {
        selector: "NewExpression[callee.name='Date']",
        message: "ANUPALAN Invariant 2 Violation: Calling new Date() directly is strictly forbidden. All time MUST come from clock.now() in packages/engine."
      }
    ]
  },
  overrides: [
    {
      // Allow Date instantiation in clock implementation and seed script
      files: [
        'packages/engine/src/clock.ts',
        'packages/engine/src/clock/**/*.ts',
        'packages/db/src/seed.ts'
      ],
      rules: {
        'no-restricted-syntax': 'off'
      }
    },
    {
      // Test files can construct reference dates if needed for asserting against clock.now()
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'no-restricted-syntax': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules',
    'dist',
    '.next',
    'coverage',
    'test-results',
    'playwright-report'
  ]
};
