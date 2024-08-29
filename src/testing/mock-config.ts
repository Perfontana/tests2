export const mockConfig = new Map<string, string>([
  ['JWT_SECRET', 'test_secret'],
  ['JWT_EXPIRES_IN', '24h'],
  ['DATABASE_URL', 'postgres://postgres:root@localhost:5432/e2e_test'],
  ['LOG_DIRNAME', 'test-logs'],
  ['LOG_FILENAME', 'tests.log'],
]);
