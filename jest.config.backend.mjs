export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/electron/tests/**/*.test.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
}
