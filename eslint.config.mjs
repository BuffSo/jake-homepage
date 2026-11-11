import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // git에서 뺀 로컬 메모 폴더. 시안을 찍는 임시 스크립트가 들어 있어도 사이트 코드가 아니다.
    "docs/private/**",
  ]),
]);

export default eslintConfig;
