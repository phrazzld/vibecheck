# CLAUDE.md for vibecheck-web

## Commands
- Build: `npm run build`
- Dev: `npm run dev --turbopack`
- Start: `npm run start`
- Lint: `npm run lint`
- Type Check: `npx tsc --noEmit`

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, use explicit typing
- **Imports**: Use named imports; absolute imports with `@/*` for src directory
- **Components**: Use functional components with explicit return types
- **Naming**: PascalCase for components, camelCase for variables/functions
- **CSS**: Use Tailwind classes with consistent ordering
- **Fonts**: Use Geist fonts (sans and mono) via variables

## Engineering Principles
- **Commits**: Use conventional commit messages (`feat:`, `fix:`, `docs:`, `chore:`)
- **Testing**: Write deterministic tests; aim for high coverage
- **Architecture**: Embrace modularity and loose coupling
- **Security**: Validate all inputs; follow least privilege principle
- **Documentation**: Document the "why" behind decisions; keep close to code
- **Error Handling**: Use explicit error handling with meaningful messages
- **Performance**: Establish baselines and monitor critical metrics
- **Automation**: Automate builds, tests, and deployments
- **Iterative Delivery**: Focus on small, deployable changes