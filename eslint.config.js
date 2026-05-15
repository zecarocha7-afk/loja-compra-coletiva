import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import js from '@eslint/js';

export default [
  {
    ignores: ['dist/**/*']
  },
  js.configs.recommended,
  firebaseRulesPlugin.configs['flat/recommended']
];
