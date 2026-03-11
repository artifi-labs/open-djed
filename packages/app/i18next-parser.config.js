export default {
  locales: ['en', 'pt'],
  output: 'messages/$LOCALE/translations.json',
  input: ['src/**/*.{ts,tsx}'],
  
  namespaceSeparator: false,
  keySeparator: '.',  
  keepRemoved: false,
  
  defaultValue: '',
}