import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "test-results/**", "playwright-report/**"],
  },
  {
    rules: {
      "@next/next/no-page-custom-font": "off",
    },
  },
];

export default config;
