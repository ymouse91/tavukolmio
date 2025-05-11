# Tavukolmio – Sanahaku

**SanahakuApp** on selainpohjainen suomenkielinen sanahakuohjelma, joka hakee merkityksiä ja synonyymejä annetuista sanoista. Lähteinä toimivat Wikipedia, Wikisanakirja ja Suomisanakirja. Sovellus on PWA-yhteensopiva ja toimii erinomaisesti myös mobiilissa.

## 🔍 Ominaisuudet

- Hakee sanojen merkitykset Wikipedia- ja Wikisanakirja-palveluista
- Välttää erisnimet (Wikipedia-haut tehdään pienaakkosin)
- Hakee synonyymit automaattisesti Wikisanakirjan sisällöstä
- Näyttää linkin Suomisanakirjan vastaavaan artikkeliin
- Estää tyhjän haun ja sanat, joita ei löydy sanalistasta
- Reaktiivinen käyttöliittymä Reactin avulla
- Täysin toimiva myös aloitusnäytöltä käynnistettävänä PWA-sovelluksena

## 🚀 Käyttöohjeet

1. Asenna riippuvuudet:
   ```bash
   npm install
   ```

2. Käynnistä kehityspalvelin:
   ```bash
   npm run dev
   ```

3. Avaa selaimessa:
   ```
   http://localhost:5173
   ```

## 📦 Julkaisu GitHub Pagesiin

1. Lisää `vite.config.js`-tiedostoon:
   ```js
   export default defineConfig({
     base: "/sanahaku/",
     plugins: [react()],
   });
   ```

2. Rakenna ja julkaise:
   ```bash
   npm run build
   npm run deploy
   ```

## 🧱 Tiedostorakenne

```
public/
├── logo.png
├── logo192.png
├── logo512.png
├── favicon.ico
├── manifest.json
src/
├── SanahakuApp.jsx
├── main.jsx
```

## 💡 Teknologiat

- React + Vite
- Wikipedia REST API
- Wikisanakirjan MediaWiki API
- Suomisanakirja-linkitys (ei API)
- HTML, CSS, moderni JavaScript

---

© 2024 Tavukolmio – Sanahaku · Avointa lähdekoodia · Käyttö sallittu vapaasti opetukseen ja kehittämiseen.
