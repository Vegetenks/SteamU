# Translations

Every text SteamU shows on screen lives in one file per language, in this folder:

| File | Language |
|---|---|
| `en.json` | English (the reference) |
| `fr.json` | French |
| `es.json` | Spanish |

No coding needed. Each line is a **key** (left, never change it) and the **text shown on screen** (right, the part you translate):

```json
"spaces.place.nom": "Plaza",
```

## A few rules

- Keep the key exactly as it is, and keep the quotes and the comma at the end of the line.
- Words in curly braces, like `{n}` or `{nom}`, are replaced by the app (a number, a name). Keep them as they are, you can move them inside the sentence.
- Keep the tone warm and simple: a five year old should understand every screen.
- Do not use the long dash or the middle dot in texts.
- SteamU follows Steam's language setting automatically. A missing text falls back to English.

## How to help

- **Fix a text:** open an issue saying which screen, what it says, and what it should say. A screenshot helps a lot.
- **Improve a whole file, or add a new language:** copy `en.json`, rename it with your language code (for example `de.json`, `it.json`, `pt.json`), translate the texts on the right, and send it as a pull request or attach it to an issue.

Thank you! Translators are credited in SteamU's contributors page.
