const definedEnv = (env: NodeJS.Dict<string>) => {
  const next: Record<string, string> = {};
  for ( const [key, value] of Object.entries(env) ) {
    if ( typeof value === "string" ) {
      next[key] = value;
    }
  }
  return next;
};

export const LOCAL_E2E_DATABASE =
  "mongodb://127.0.0.1:27017/leaseqa_e2e";

export const withPlaywrightDefaults = (
  env: NodeJS.Dict<string> = process.env,
) => ({
  ...definedEnv(env),
  CI_DISABLE_RATE_LIMIT: env.CI_DISABLE_RATE_LIMIT || "true",
  DATABASE_CONNECTION_STRING:
    env.DATABASE_CONNECTION_STRING || LOCAL_E2E_DATABASE,
});
