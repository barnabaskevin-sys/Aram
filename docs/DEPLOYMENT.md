# Deploying Aram

Aram is a static site: files only, no server, no database, no account. Vercel builds it from the repository on every push.

## Before you publish

1. **Texts permission.** Most verse texts are Project Madurai e-texts. Confirm that their "freely distribute" permission covers your use, and keep their notice. The app shows it under Settings → Texts and credits; `NOTICE.md` has the wording.
2. **Translations.** The 44 non-English languages are AI-written and have had no native-speaker review. Either review the ones you promote or say so on your page.
3. **Privacy.** Nothing a visitor types leaves their device, and the app contacts no third party: fonts are bundled and there are no analytics.

## Vercel

The repository holds a `vercel.json`, so there is nothing to configure by hand.

| Setting | Value (from `vercel.json`) |
|---|---|
| Framework | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

### First deploy, from the website

1. Sign in at <https://vercel.com> with your GitHub account.
2. **Add New → Project**, and import `barnabaskevin-sys/Aram`. Grant Vercel access to the repository if it asks.
3. Leave the detected settings as they are and press **Deploy**. The build takes about a minute.
4. You get an address like `https://aram-xxxx.vercel.app`. Add your own domain under **Settings → Domains** if you have one.

**Branches.** Vercel deploys the repository's default branch (`main`) as **Production**, and every other branch as a **Preview** with its own address. While you work on `first_version`, each push gives a preview link; merge into `main` to update the production site. You can change the production branch under **Settings → Git**.

### From the command line (optional)

```
npm install -g vercel
vercel            # a preview deploy; the first run links the folder to a project
vercel --prod     # production
```

### Cache headers

`vercel.json` marks everything in `/assets/` (the scripts, styles, fonts and the corpus, all with a content hash in the file name) as cacheable for a year, and the service worker files as always revalidated. A new deploy therefore reaches visitors on their next visit, and unchanged files are not downloaded again.

The first visit downloads about 8 MB, most of it the verse corpus; Vercel compresses it in transit to roughly a quarter of that.

## Other static hosts

Any host that serves a folder over HTTPS works the same way: build command `npm run build`, publish directory `dist`. For Netlify or Cloudflare Pages that is all; the cache headers in `vercel.json` apply to Vercel only.

## Phones

Open the deployed address on the phone and install it from the browser: **Add to Home Screen** in Safari on iPhone (Share menu), **Install app** or **Add to Home screen** in Chrome on Android. This needs HTTPS, which Vercel provides.

## After you deploy: a five-minute check

On a phone, using the real address:

1. The page loads and shows a **verse of the day**; **Another verse** changes it.
2. **Check**: paste `தற்காத்துத் தற்கொண்டாற் பேணித் தகைசான்ற சொற்காத்துச் சோர்விலாள் பெண்`. It should say **Exact match**.
3. **Library**: open a shelf, then a chapter; verses and kolams appear. The browser's Back button returns to the shelf.
4. The **globe** icon changes the language. Try Tamil, then Arabic (the layout should mirror).
5. **Settings**: day and night themes work; **Texts and credits** shows the Project Madurai notice.
6. Visit once, switch to airplane mode, reload. The page should still open.

## Updating

Commit and push; Vercel builds and deploys. The offline cache updates itself: a visitor who has the app open gets the new version on the next load.
