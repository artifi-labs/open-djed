export default {
  input: ['app/**/*.{js,jsx,ts,tsx}'],
  createOldCatalogs: false,
  locales: ['en', 'pt'],
  output: './locales/$LOCALE/$NAMESPACE.json',
  defaultNamespace: 'translation',
  keySeparator: true,
  namespaceSeparator: false,
  useKeysAsDefaultValue: true,
  defaultValue: "",
  keepRemoved: false,
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  },
  react: {
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    removeExtraWhitespaces: true
  }
};
