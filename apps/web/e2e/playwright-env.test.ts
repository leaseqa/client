import { describe, expect, it } from "vitest";
import {
  LOCAL_E2E_DATABASE,
  withPlaywrightDefaults,
} from "./playwright-env";

describe("withPlaywrightDefaults", () => {
  it("defaults local Mongo and disables auth rate limits", () => {
    expect(
      withPlaywrightDefaults({ PATH: "/usr/bin", CI_DISABLE_RATE_LIMIT: undefined }),
    ).toEqual({
      PATH: "/usr/bin",
      CI_DISABLE_RATE_LIMIT: "true",
      DATABASE_CONNECTION_STRING: LOCAL_E2E_DATABASE,
      NODE_ENV: process.env.NODE_ENV,
    });
  });

  it("keeps NODE_ENV so child_process env matches ProcessEnv", () => {
    expect(withPlaywrightDefaults(process.env).NODE_ENV).toBe(process.env.NODE_ENV);
  });

  it("keeps CI-provided Mongo and rate-limit flags", () => {
    expect(
      withPlaywrightDefaults({
        DATABASE_CONNECTION_STRING: "mongodb://127.0.0.1:27017/leaseqa_ci",
        CI_DISABLE_RATE_LIMIT: "true",
      }),
    ).toMatchObject({
      DATABASE_CONNECTION_STRING: "mongodb://127.0.0.1:27017/leaseqa_ci",
      CI_DISABLE_RATE_LIMIT: "true",
    });
  });
});
