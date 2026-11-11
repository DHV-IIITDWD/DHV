# Data methodology and interpretation rules

## Source files present in the repository

- `dataset/nirf_2017.csv` through `dataset/nirf_2025.csv`: nine yearly files.
- `data handling/nirf_merged.csv`: preprocessed merged file.
- `data handling/nirf_merge_simple.ipynb` and `nirf_merge.ipynb`: preprocessing notebooks.

The simple notebook's saved output reports 6,924 records and 14 columns. It reports 1,124 project-level institute IDs, 33 states and 255 rows with at least one filled field. Categories are introduced over time (notably Medical in 2018, Dental in 2020, Research in 2021, Agriculture in 2023 and State Public University in 2024). Cross-year category comparisons must therefore use only years in which the category exists.

## Cleaning already performed in the notebook

- Trim whitespace in institute, city and state fields.
- Normalise name punctuation/case and selected city/state aliases.
- Use name + state as a base identity; add city only where same-state names clash.
- Build `inst_id` and harmonise name/city/state to the latest spelling.
- Preserve genuine same-rank ties; do not deduplicate by rank.
- Mark rows containing imputed values with `filled`.

## Existing imputation (must disclose)

The notebook fills missing rank from dense score rank within year/category; sets TLR/RPC/GO to zero for Research rows (not measured for that category); interpolates a missing score in rank order; and fills remaining parameter gaps with the year/category median. It reports 255 rows touched and no missing values remaining in the six numeric ranking/score/parameter columns.

These are **estimated or structural placeholders**, not all direct NIRF measurements. Treat `filled=true` as provenance. In particular, zero for Research TLR/RPC/GO means not measured in that category, not evidence of zero performance. Avoid using these zeros in parameter correlation/radar comparisons unless the analysis explicitly defines and justifies that treatment.

## Rank handling

The raw yearly files may use rank intervals. The frontend must preserve the original text. A band such as `101–150` is not a point value. Use interval membership for band-level questions; use exact-rank comparisons only for exact rank observations. For top-100 counts, include a band only when the full band is within the top 100; for a band straddling the cutoff, mark it ambiguous or report bounds rather than silently deciding.

## Missingness

Do not impute missing values in the frontend. Display missingness and sample size. Keep rank-missing rows for score/parameter analyses when otherwise valid, while excluding them from rank-specific analyses. A field being partly available does not mean every selected row contains it.

## Multi-year institution identity

Prefer `inst_id` from the merged dataset. Raw yearly source files may not have a stable identifier; use conservative normalized name/state/city matching and flag ambiguous candidate matches for human review. Never fuzzy-merge two same-name institutes in different cities automatically.
