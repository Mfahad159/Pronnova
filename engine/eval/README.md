# Engine evaluation clips

Team-recorded clips only (no real student audio, ADR-002). For each clip add a line to `clips.csv`:

```
file,reference_text,expected_wrong_words,speaker,notes
v-w-01.webm,We visited the village very early.,"visited;village;very",fahad,says w for v
```

Used to compare `azure` and `python` engines: do they flag the same wrong words, and how long does each take?
