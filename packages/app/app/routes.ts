import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('/djed', 'routes/djed.tsx'),
  route('/shen', 'routes/shen.tsx'),
  route('/privacy', 'routes/privacy.tsx'),
  route('/terms', 'routes/terms.tsx'),
  route('*', 'routes/not_found.tsx'),
] satisfies RouteConfig
