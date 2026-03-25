export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setuptest.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/src/test/mocks/fileMock.ts',
  },
  testMatch: ['**/frontend/tests/**/*.test.ts?(x)'],
  reporters: [
    [
      'default',
      [
        'jest-html-reporters',
        {
          publicPath: './test-results',
          filename: 'frontend-unit.html',
          openReport: true,
        },
      ],
    ],
  ],
}
