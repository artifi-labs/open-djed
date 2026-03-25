---
sidebar_position: 1
---

# Contributing

Open Djed is open for community contributions.

We believe transparent and accessible tooling is essential for Cardano, and we want to keep the same bar for quality across code, documentation, and user experience.

## Process

1. Check open GitHub issues and pick one.
2. Before opening a PR, make sure the issue is clear enough to implement. If needed, ask questions in the issue discussion first.
3. Fork the repository, create your branch, and open a draft pull request linked to the issue.
4. Follow the contribution rules and keep your scope focused.
5. When ready, mark the PR as ready for review.
6. Maintainers review the change and request adjustments when needed.
7. Once approved, the PR is merged and released in a future update cycle.

:::note
Maintainers have the final decision on whether a change is accepted.
:::

## Contribution Rules

- Use conventional commits
- Keep pull requests focused and easy to review
- Include tests when behavior changes
- Include screenshots for UI changes when relevant
- Avoid unrelated refactors in the same PR

## Style Guide

For consistency:

- Follow existing structure and naming patterns in each package
- Keep docs concise
- Add cross-links to related pages when introducing new concepts

## Ways to Contribute

- Report bugs and edge cases
- Improve documentation and examples
- Fix issues and refactor existing code
- Add new features in app, API, sync jobs, or shared packages
- Design improvements and UI/UX enhancements
- Translation and accessibility improvements
- Add or improve tests

## Pull Request Checklist

Before opening a PR, confirm:

- The change has a clear scope and motivation
- Lint and tests pass locally
- New behavior is documented (if applicable)
- Migrations are included when schema changes are introduced

In your PR description, include:

- What changed
- Why it changed
- How it was tested
- Any follow-up work or known limitations

## Local Development

### Run a Specific Package

Use the package scripts depending on the area you are working on.

Check architecture docs for more details on the packages and their responsibilities. [Architecture](../architecture/index.md)

## Code Quality

From the repository root, run:

```sh
# Lint and format
bun run lint && bun run format

# Tests
bun run test
```

When possible, also run tests in the package you changed.

## Commit Style

Keep commits focused and small whenever possible.

- Prefer one logical change per commit
- Use clear commit messages that explain intent
- Avoid mixing unrelated refactors with feature work

## Need Help?

If you are unsure where a change belongs, start by checking the [Project Architecture](../architecture/index.md) page and open a draft PR early so maintainers can guide direction.
