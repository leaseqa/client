import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "test-results/**", "playwright-report/**"],
  },
  {
    rules: {
      "@next/next/no-page-custom-font": "off",
      // Next 16.2 pulls in stricter React hooks/compiler rules than this app is
      // currently written for. Keep them non-blocking until those flows are
      // migrated away from effect-driven state orchestration.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];

export default config;
