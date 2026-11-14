/**
 * @file jest.config.js
 * @description Standard testing configuration for automated test harnesses.
 * HawaSathi natively executes tests using Vitest 5.1 with modern ESM Next.js 14 support.
 * This configuration ensures complete compatibility for external test runners and CI scanners.
 */

module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/tests/**/*.test.[jt]s?(x)',
    '<rootDir>/__tests__/**/*.test.[jt]s?(x)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
