// @ts-check
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const localRulesPlugin = {
  rules: {
    'no-inline-log-strings': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Disallow inline string literals for logger message/context. Use constants instead.',
        },
        schema: [],
        messages: {
          inlineMessage:
            "Avoid inline log 'message' string literal. Extract it to a constant (e.g. LOG_MESSAGES.X).",
          inlineContext:
            "Avoid inline log 'context' string literal. Reuse a class property or constant (e.g. this.logContext).",
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.type !== 'MemberExpression') return;
            if (node.callee.property.type !== 'Identifier') return;

            const logMethod = node.callee.property.name;
            if (!['info', 'warn', 'error', 'debug'].includes(logMethod)) return;

            const firstArg = node.arguments[0];
            if (!firstArg || firstArg.type !== 'ObjectExpression') return;

            for (const property of firstArg.properties) {
              if (property.type !== 'Property') continue;

              const keyName =
                property.key.type === 'Identifier'
                  ? property.key.name
                  : property.key.type === 'Literal'
                    ? String(property.key.value)
                    : null;

              if (keyName !== 'message' && keyName !== 'context') continue;

              const valueNode = property.value;
              const isInlineStringLiteral =
                (valueNode.type === 'Literal' && typeof valueNode.value === 'string') ||
                (valueNode.type === 'TemplateLiteral' && valueNode.expressions.length === 0);

              if (!isInlineStringLiteral) continue;

              context.report({
                node: valueNode,
                messageId: keyName === 'message' ? 'inlineMessage' : 'inlineContext',
              });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      local: localRulesPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['./tsconfig.json', './tsconfig.test.json'],
          defaultProject: './tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: '@nestjs/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-unresolved': 'error',
      'sort-imports': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    files: ['src/modules/user/use-cases/create-users/**/*.ts'],
    rules: {
      'local/no-inline-log-strings': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.unit.spec.ts', '**/*.e2e.spec.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.test.json',
        },
      },
    },
    rules: {
      'import/order': 'off',
      'import/newline-after-import': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'local/no-inline-log-strings': 'off',
    },
  },
);
