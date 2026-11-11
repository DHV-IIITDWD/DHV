# Validation status — final integration pass

## Passed checks

- The bundled merged dataset audit completed: **6,924 rows × 14 columns**, years **2017–2025**, **13 categories**, **33 states**, **1,124 unique project institution IDs**, **0 duplicate `(year, category, inst_id)` keys**, and **255 rows flagged as filled** (about **3.68%**).
- The independent rank parser cases passed: **7/7** deterministic cases, including exact ranks, closed intervals, open-ended bands and missing labels.
- The frontend TypeScript check passed after the final graph-selector update using the installed TypeScript compiler: `node node_modules/typescript/bin/tsc --noEmit` from `frontend/`.
- Backend Python source passed `python -m compileall -q backend`. No backend `tests/` directory is included in this repository, so a pytest suite is not claimed.
- All **41 registered question handlers** (the 40 Annexure questions plus one supplemental analysis) were executed against the bundled merged CSV for all **13 categories**: **492 category/question smoke-test runs passed with no runtime exceptions**. This confirms handler execution and result shape, not full browser rendering or independent verification of every numeric interpretation.
- Project source was checked for unresolved Git conflict markers after replacing the conflicted frontend README.

## Not claimed as passed

- A complete `vite build` was **not** completed in this environment. The ZIP's pre-existing `node_modules` contains only Windows Rollup native binaries and non-executable `.bin` launchers; the Linux runner has no matching Rollup native binary. A clean `npm ci` could not retrieve packages because the npm registry connection failed (`EAI_AGAIN` / network resolution). The machine-specific `node_modules` folder is excluded from the final ZIP.
- All 40 questions have **not** been exhaustively executed through the browser against every category/year combination. The source registry includes the 40 sample question handlers and their logic was inspected/adjusted, but that is not the same as full end-to-end browser QA.
- The India map requires an internet connection to retrieve the DataMeet/GeoDataViewer GeoJSON through the local Vite proxy. A failed map request is handled with a visible fallback; it does not claim offline map availability.
- Live Gemini API access requires the user's own backend `.env` and API key and was not tested here.

## Reproducible local verification

From `frontend/` on the user's Mac:

```bash
npm ci
npm run build
npm run dev
```

For the optional API backend, follow `README.md` and provide a valid Gemini API key. Do not ship a developer's `.env`, API key, `node_modules`, or local virtual environment.
