/** @type {import("eslint").Linter.Config} */
const config = {
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint', 'import'],
};

module.exports = config;
