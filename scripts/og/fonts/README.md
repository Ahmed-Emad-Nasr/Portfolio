# Share-card fonts

Small single-file fonts used only by the build-time image generators in
`scripts/og/` (case OG images, the share card, the app icon). They are inlined
as data URIs, so they have to be small single files.

The website does not use these: it loads the Sensei-Dev font set from
`app/fonts.css` and `app/fonts/<family>/*.woff2`.

All four families are licensed under the SIL Open Font License 1.1
(https://openfontlicense.org): Outfit, JetBrains Mono, Dela Gothic One,
Yuji Syuku.

- `outfit-latin.woff2`, `jetbrains-mono-latin.woff2` — Latin variable files from
  @fontsource.
- `dela-gothic-one.woff2`, `yuji-syuku.woff2` — subsets made by
  `scripts/subset-fonts.py`. Re-run it after adding new Japanese text.
