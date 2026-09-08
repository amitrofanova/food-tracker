import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import pluginOxlint from 'eslint-plugin-oxlint';
import skipFormatting from 'eslint-config-prettier/flat';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'android/**', 'ios/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: true,
          classes: true,
          variables: true,
          typedefs: true,
        },
      ],
      'vue/no-v-html': 'error',
      // Предупреждает о потенциально опасных href/src атрибутах (javascript: протоколы)
      // Требует кастомной валидации или безопасных связок
      'vue/no-parsing-error': 'error',
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message:
            'Избегайте прямого использования window без необходимости. Проверьте, не утекли ли туда важные данные.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          property: 'innerHTML',
          message:
            'Использование innerHTML уязвимо для XSS. Используйте textContent или v-clean-html.',
        },
      ],
    },
  },

  skipFormatting,
);
