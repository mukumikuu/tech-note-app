export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'src/electron/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/electron/tests/**/*.test.ts'],
  reporters: [
    [
      'default',
      [
        'jest-html-reporters',
        {
          publicPath: './test-results',
          filename: 'backend-unit.html',
          openReport: true,
        },
      ],
    ],
  ],
}
