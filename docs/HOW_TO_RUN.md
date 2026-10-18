# How to run Aram

## What you need

| To do this | You need |
|---|---|
| Run, build and check the app | [Node.js](https://nodejs.org) 20 or newer (it includes npm) |
| The layout check in every language | Also a Chromium browser for Playwright: `npx playwright install chromium`, or an installed Edge or Chrome (see below) |

On Windows you can install Node.js with `winget install OpenJS.NodeJS.LTS`, then open a new terminal.

## 1. Install the dependencies

Once, in the repository folder:

```
npm install
```

## 2. Develop

```
npm run dev
```

Open <http://localhost:5173>. Changes to any file in `src/`, `index.html` or the styles show at once. Press `Ctrl+C` to stop.

The offline cache (service worker) is off in this mode, so you always see the current code.

## 3. Build and preview the real site

```
npm run build        # writes dist/, the folder Vercel publishes
npm run preview      # serves dist/ at http://localhost:4173
```

The preview is the production build with the offline cache switched on. After a rebuild, reload once or twice: the cache picks up the new version in the background. To start clean, open the browser's developer tools → Application → Storage → **Clear site data**.

To try it on a phone on the same Wi-Fi, run `npm run preview -- --host` and open the address it prints. The phone will not offer to install it or keep it offline, because that needs HTTPS; use a Vercel preview deploy for that.

## 4. Change the app

| To change | Edit |
|---|---|
| Wording in any language | `src/i18n/` (`core.js` is the English master, `lang-01..13.js` the rest) |
| Colours, fonts, layout | `src/styles/aram.css` |
| A screen | `src/views/home.js`, `check.js`, `library.js`, `settings.js` |
| The verse card | `src/ui/card.js` |
| Tabs and routes | `src/app.js` |
| Page markup | `index.html` |
| Icons, manifest | `public/` |

There is no generated code to keep in step: what you edit is what runs.

## 5. Checks

**Translations.** Every language has every key, placeholders such as `{n}` are intact, and each language uses its own script:

```
npm run check:i18n
```

Expected last line: `languages with dictionaries: 44 / 44  problems: 0`.

**Layout in every language.** This opens the built app at phone size in each of the 45 languages, visits Home, Check, Library, one open work and Settings, and reports anything that overflows or is clipped. Start the preview first, then run the sweep in a second terminal:

```
npm run build
npm run preview                    # terminal 1
npm run sweep                      # terminal 2: all 45 languages
npm run sweep -- en ta ar          # just some of them
```

Each line ends in `OK` when nothing is wrong, for example `ar ar|rtl OK`. Screenshots for Arabic, Tamil, Japanese, Thai and Hindi go to `shots/`.

The sweep uses Playwright's own Chromium (`npx playwright install chromium`). To use a browser you already have, set `PW_CHANNEL`: `$env:PW_CHANNEL="msedge"; npm run sweep` in PowerShell, or `PW_CHANNEL=msedge npm run sweep` in bash.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm` is not recognised | Install Node.js, then open a **new** terminal (or restart VS Code) so it finds it. |
| You rebuilt but still see the old page | Reload twice. If it persists, developer tools → Application → Storage → Clear site data. |
| "Could not load the library" | The verse file did not download. Check the connection and reload; in `npm run dev`, check the terminal for errors. |
| `npm run sweep` cannot connect | Start `npm run preview` first, in another terminal. |
| `browserType.launch: Executable doesn't exist` | Run `npx playwright install chromium`, or set `PW_CHANNEL=msedge`. |
