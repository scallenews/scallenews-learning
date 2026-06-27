import js from "@eslint/js";
import jestPlugin from "eslint-plugin-jest";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  // 1. Configuração base do ESLint com regras recomendadas
  js.configs.recommended,

  // 2. Configuração Global (Aplica ambientes Node, Browser e suporte a JSX)
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // Resolve 'process', 'require', 'module', 'console'
        ...globals.browser, // Resolve 'fetch' e APIs de navegador
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Resolve o erro de Parsing do React/HTML 'Unexpected token <'
        },
      },
    },
  },

  // 3. Configuração do Jest para arquivos de teste
  {
    files: ["**/*.test.js", "**/*.test.jsx", "**/*.spec.js", "**/*.spec.jsx"],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },

  // 4. Configuração das regras do Next.js
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // 5. Desativa regras conflitantes com o Prettier (Sempre no final)
  prettierConfig,

  // 6. Pastas ignoradas pelo Linter
  {
    ignores: [".next/*", "node_modules/*", "dist/*"],
  },
];
