# Annexure A question implementation review

The frontend question registry contains 40 sample-question IDs across the eight assignment domains. Every registered question is invoked by the Section page with the currently selected category/year and the source rows that pass the global imputation filter. Each result can include a chart, a supporting table, and a method/interpretation note.

## Reliability rules applied

1. **Identity and matching:** use `inst_id` as the preferred longitudinal key. When absent, use normalised institution name + state + city. Do not match campuses solely on a shared name.
2. **Exact movement:** rank-place gain/loss requires exact numeric ranks at both endpoints. Rank bands remain available as labels and for safe threshold/band membership checks.
3. **Threshold membership:** a band counts inside a threshold only when its entire interval is within it. A band crossing the top-10/top-50/top-100 boundary is not silently assigned to one side.
4. **Non-rank rows:** retain valid year/name rows with missing rank. These can contribute to score questions but not rank-specific calculations.
5. **Imputation:** source rows marked `filled` are excluded by default. The global control explicitly enables them; the page uses the same filtered rows for charts and tables.
6. **Correlation:** use pairwise complete observations, state sample size, and distinguish association from causation.
7. **First observed:** where a question identifies new appearances, describe them as first observed in the dataset, not necessarily newly established institutions.
8. **Outliers and distributions:** explain screening rules and sample size; structural placeholders must not be interpreted as measured institutional performance.

## Key question-specific treatments

- **1.1–1.3:** retain rank-band labels; rank history plots exact rank values only; place movement uses exact ranks and stable IDs.
- **1.5, 2.1–2.3, 2.4:** top-10/top-100 membership requires the full rank range to be within the threshold. Q2.2 adds all 36 state/UT regions to its choropleth, with zero-count regions retained.
- **2.5:** count first observations among actually ranked records; use stable identity and label the result as first observed.
- **3.2:** rank distribution uses the lower endpoint of a rank band only as a disclosed numeric proxy, not as exact rank.
- **4.x:** correlation is pairwise and accompanied by n; no causal interpretation is made.
- **5.1–5.5:** display rank labels rather than converting ranges into exact places; Q5.4 longitudinal matching uses stable IDs.
- **6.1:** rank-band cases that cross the top-10 cutoff are excluded from the two comparison groups and disclosed.
- **7.1:** the primary bar is only “Entered Top 50”; the table contains institutions that moved from wholly within 51–100 to wholly within 1–50 between selected years.
- **7.2–7.5:** stable-ID matching is used for transitions; rank-band flows are separated from exact-place movement.
- **8.x:** exact-rank-only logic is used where a numeric rank metric is necessary; outlier rules are stated in the question result.

## Graph type selection

Questions with valid alternative encodings expose a selector while retaining the same underlying analytical result. Examples include line/area/grouped columns, bar/lollipop, radar/grouped bars/parallel coordinates, scatter with or without a trend line, and distribution modes. Not every chart receives alternatives: maps, Sankey flows, and specialised statistical displays remain native where an automatic conversion could change the meaning. Q2.2 keeps the map and historical trend as two distinct outputs.

## Evaluation still recommended

The source contains the 40 question handlers, but the final evaluator should exercise them with each relevant category/year and a few uploaded datasets. Confirm category availability before comparing years; do not treat a category that did not exist in an earlier year as a zero-performance observation. For oral evaluation, be prepared to explain the rank-band policy, institution ID fallback, imputation provenance, GeoJSON source/limitation and the selected statistical screening rules.
