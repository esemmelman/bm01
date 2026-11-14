# B’nai Mitzvah preparation

Static site hosted at https://esemmelman.github.io/bm01/.

## Shared sentence checklist

The Sentences view contains 46 sentences extracted from Google Doc
`1H1FeOnmcoG6adM-HbzMolOGV4H1X5K3IiUpIsupmmJQ`, tab `t.xygo9jjhujlo`.
`sentences.json` records this source snapshot; abbreviations such as `mins.` do
not end a sentence. Subsequent Google Doc edits are not automatically imported.

The existing Supabase project `fgomaujsdblpzxhnnqrg` stores both ordered text and
checkboxes in the dedicated `public.bm01_sentences` table. Database setup is
recorded in `database/setup.sql` and was applied through the hosted migration
`bm01_shared_sentence_checklist`.

This is deliberately one public shared checklist, without device-specific
storage or accounts. Visitors can read the sentences and change only `checked`;
they cannot change text, add sentences, or remove them. Only a publishable key
is included in the frontend. No other existing tables or policies were changed.

Visible Sentences views refresh every three seconds, and on focus/reconnection.
The most recently saved change to a sentence wins. Offline saves show an error
and do not claim success. Initial checkboxes stay disabled until shared state
loads. The browser print dialog can save the current view as PDF.

## Verification

With Playwright installed, run `node verify-sentences.cjs`. Optionally set
`PLAYWRIGHT_PATH` to its module path and `CHROMIUM_PATH` to a browser executable.
Set `TEST_URL` to test a deployed site. This integration test temporarily toggles
sentence 46 and restores its original state in a `finally` block.
