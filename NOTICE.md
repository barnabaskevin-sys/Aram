# Notices and credits

**அறம் · Aram** bundles texts, fonts and an engine that belong to other people. Please keep this file with the app.

## The texts

Most texts are **Project Madurai** e-texts (<https://www.projectmadurai.org>). Their notice asks that it be kept with the texts:

> © Project Madurai, 1998-2021. Project Madurai is an open, voluntary, worldwide initiative devoted to preparation of electronic texts of tamil literary works and to distribute them free on the Internet. Details of Project Madurai are available at the website http://www.projectmadurai.org/ You are welcome to freely distribute this file, provided this header page is kept intact.

The same notice is shown inside the app (Settings → Texts and credits). The full per-work credits (who typed and proof-read each edition, what is missing) are in `app/modules/sheets.js` (list `CR`) and are shown in the app.

| Work | Source |
|---|---|
| Thirukkural | tk120404/thirukkural dataset (Apache License 2.0), 24 corrections from other editions; English by G. U. Pope (1886) from Project Madurai |
| Nālaṭiyār, Tolkāppiyam, Puṟanāṉūṟu, Maṇimēkalai, Cilappatikāram, Kuṟuntokai, Kalittokai, Akanāṉūṟu, Patiṟṟuppattu, Auvaiyār, Tēvāram, Tirumantiram, Tiruvācakam, Eighteen Minor Works | Project Madurai e-texts (editors and proof-readers credited in the app) |

> **Before you publish in a store**, check that Project Madurai's "freely distribute" permission covers what you plan (a free app listing; and especially any paid or ad-supported version). The simplest way to be sure is to write to Project Madurai and keep their reply. Public-domain status of the classical poems themselves is not the question; the e-text editions carry the volunteers' terms.

## Fonts (SIL Open Font License 1.1)

Tiro Tamil, Noto Serif Tamil, Mukta Malar, bundled as `.woff2` files in `app/fonts/` (from the @fontsource packages).

## Engine

The metre check and the kolam drawing come from **Yāppu 0.5** (MIT, © 2026 Kevin Cruz).

## Tools used to build the app

Capacitor (MIT), @capacitor/assets (MIT), Playwright (Apache-2.0, used only to test and to draw the icon).

## AI-written meanings

Meanings and answers shown in the app are written by an AI model (Anthropic's Claude) from the verse itself. They are study aids, not authoritative commentary. The interface texts in 44 languages besides English were also written with AI help and have **not** been reviewed by native speakers; see the README.
