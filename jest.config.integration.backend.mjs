export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/integration/backend/*.test.ts'],
  reporters: [
    [
      'default',
      [
        'jest-html-reporters',
        {
          publicPath: './test-results',
          filename: 'backend-it.html',
          openReport: true,
        },
      ],
    ],
  ],
}
