import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-three/fiber mutates three.js objects (Bone rotations, Vector3 scratch
    // values) inside useFrame every frame — external WebGL resources, not React
    // state. The immutability rule flags this R3F idiom, so it is off for canvas files.
    files: ["components/AvatarCanvas.tsx", "components/HeroWebGLCanvas.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
