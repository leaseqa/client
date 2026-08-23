import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import {
  apiClient,
  apiUrl,
  createApiClient,
  oauthUrl,
  unwrapData,
} from "./client";

async function requestWithRejectedAdapter(
  rejection: {
    code?: string;
    message?: string;
    response?: { status?: number; data?: unknown };
  },
  config: { signal?: AbortSignal } = {},
) {
  const client = createApiClient(async (requestConfig) => {
    const error = new AxiosError(
      rejection.message || "Request failed",
      rejection.code,
      requestConfig,
    );
    if ( rejection.response ) {
      error.response = {
        status: rejection.response.status ?? 0,
        statusText: "",
        headers: {},
        config: requestConfig,
        data: rejection.response.data,
      };
    }
    throw error;
  });
  return client.request({
    url: "/api/test",
    method: "get",
    ...config,
  });
}

describe("apiUrl", () => {
  it("uses same-origin api paths when no public server is configured", () => {
    expect(apiUrl("/posts", {})).toBe("/api/posts");
  });

  it("prefixes an explicit public origin when configured", () => {
    expect(
      apiUrl("/posts", { NEXT_PUBLIC_HTTP_SERVER: "https://api.example.com/" }),
    ).toBe("https://api.example.com/api/posts");
  });
});

describe("oauthUrl", () => {
  it("never falls back to localhost when no public origin is set", () => {
    expect(oauthUrl("google", {})).toBe("/api/auth/google");
  });

  it("uses the same public-origin resolver as apiUrl", () => {
    expect(
      oauthUrl("google", { NEXT_PUBLIC_HTTP_SERVER: "https://api.example.com" }),
    ).toBe("https://api.example.com/api/auth/google");
  });
});

describe("public origin resolution", () => {
  it("resolves the same url from the inlined default on both server and client", () => {
    // The default parameter has to read NEXT_PUBLIC_HTTP_SERVER as a literal
    // member expression, otherwise the browser bundle cannot see it and renders
    // a same-origin path while the server renders the configured origin. React
    // does not patch attribute mismatches, so the stale href would survive
    // hydration.
    const fromDefault = oauthUrl("google");
    const fromExplicit = oauthUrl("google", {
      NEXT_PUBLIC_HTTP_SERVER: process.env.NEXT_PUBLIC_HTTP_SERVER,
    });
    expect(fromDefault).toBe(fromExplicit);
  });

  it("keeps apiUrl and oauthUrl on the same origin", () => {
    const env = { NEXT_PUBLIC_HTTP_SERVER: "https://api.example.com" };
    expect(apiUrl("/auth/google", env)).toBe(oauthUrl("google", env));
  });

  it("treats a blank public origin as same-origin", () => {
    expect(oauthUrl("google", { NEXT_PUBLIC_HTTP_SERVER: "" })).toBe(
      "/api/auth/google",
    );
    expect(oauthUrl("google", { NEXT_PUBLIC_HTTP_SERVER: undefined })).toBe(
      "/api/auth/google",
    );
  });
});

describe("unwrapData", () => {
  it("extracts the server envelope payload", () => {
    expect(unwrapData({ data: { id: "1" } })).toEqual({ id: "1" });
  });

  it("returns the value when the envelope is already unwrapped", () => {
    expect(unwrapData({ id: "1" })).toEqual({ id: "1" });
  });
});

describe("apiClient", () => {
  it("sends credentials and times out after 20 seconds", () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(apiClient.defaults.timeout).toBe(20_000);
  });

  it("normalizes server errors without exposing axios internals", async () => {
    await expect(
      requestWithRejectedAdapter({
        response: {
          status: 403,
          data: { error: { code: "FORBIDDEN", message: "Denied" } },
        },
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
      code: "FORBIDDEN",
      message: "Denied",
    });
  });

  it("rejects canceled requests as ApiError without axios fields", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      requestWithRejectedAdapter(
        { code: "ERR_CANCELED", message: "canceled" },
        { signal: controller.signal },
      ),
    ).rejects.toMatchObject({
      name: "ApiError",
      code: "ABORTED",
    });
  });
});
