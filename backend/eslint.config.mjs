import globals from "globals";
import tseslint from "typescript-eslint";
import pluginPrettier from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  // Configurações globais
  {
    ignores: ["dist", ".eslintrc.js"],
  },
  
  // Configuração principal para arquivos TypeScript
  {
    files: ["src/**/*.ts"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // Ponto chave: informa ao ESLint sobre seu projeto TS
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  
  // Integração com o Prettier (deve ser a última configuração)
  pluginPrettier,
);
