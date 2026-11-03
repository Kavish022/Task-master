/**
 * Typed environment configuration.
 * All access to import.meta.env should go through this file to ensure type safety.
 */

interface EnvConfig {
  readonly apiBaseUrl: string;
  readonly appName: string;
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly enableMockApi: boolean;
}

const getEnvVar = (key: keyof ImportMetaEnv, fallback = ''): string => {
  const value = import.meta.env[key];
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value);
};

export const ENV: EnvConfig = Object.freeze({
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', '/api'),
  appName: getEnvVar('VITE_APP_NAME', 'React Architecture Starter'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  enableMockApi: getEnvVar('VITE_ENABLE_MOCK_API', 'false') === 'true',
});
