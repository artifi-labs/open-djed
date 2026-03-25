# Math

Package holding Open DJED math utilities used across protocol integrations.

This package centralizes deterministic calculations for rates, reserve limits, market cap, fees, and rational arithmetic, so all other packages can reuse the same formulas.

## What this package provides

- Rational number operations based on `bigint` (`Rational` + helpers).
- DJED/SHEN conversion rates derived from pool + oracle data.
- Reserve ratio and mint/burn limits.
- Operator fee calculation with min/max bounds.
- DJED/SHEN market cap helpers (ADA and USD views).

## Testing

To run tests from repo root:

```bash
bun run test
```

## Notes

- Calculations are built around `bigint` and `Rational` to reduce floating-point drift.
- Some parameters (like reserve thresholds) are currently constants and marked to move to network registry configuration.
