module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/config/'
    ],
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/config/**',
        '!src/tests/**'
    ],
    coverageReporters: ['text', 'lcov', 'clover', 'html'],
    moduleFileExtensions: ['js', 'json'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/config/'
    ],
    transform: {}
};
