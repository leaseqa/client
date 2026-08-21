const definedEnv = (env: NodeJS.Dict<string>) => {
  const next: Record<string, string> = {};
  for ( const [key, value] of Object.entries(env) ) {
    if ( typeof value === "string" ) {
      next[key] = value;
    }
  }
  return next;
};

const resolveNodeEnv = (
  value: string | undefined,
): NodeJS.ProcessEnv["NODE_ENV"] => {
  if ( value === "development" || value === "production" || value === "test" ) {
    return value;
  }

  return process.env.NODE_ENV;
};

export const LOCAL_E2E_DATABASE =
  "mongodb://127.0.0.1:27017/leaseqa_e2e";

export const withPlaywrightDefaults = (
  env: NodeJS.Dict<string> = process.env,
): NodeJS.ProcessEnv & Record<string, string> => ({
  ...definedEnv(env),
  CI_DISABLE_RATE_LIMIT: env.CI_DISABLE_RATE_LIMIT || "true",
  DATABASE_CONNECTION_STRING:
    env.DATABASE_CONNECTION_STRING || LOCAL_E2E_DATABASE,
  NODE_ENV: resolveNodeEnv(env.NODE_ENV),
});
