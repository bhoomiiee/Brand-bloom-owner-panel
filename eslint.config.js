import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }]
    }
  }
];
