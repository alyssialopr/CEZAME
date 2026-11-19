# Kit de marque CEZAME

Toutes les déclinaisons officielles du logo **CEZAME** (toucan + typographie *Matcha Style*) en **PNG haute résolution** (fond transparent) et **SVG vectoriels** (tracés `<path>` autonomes, sans dépendance de police).

## Structure des dossiers

- `png/` — 20 fichiers PNG haute résolution à fond transparent :
  - **Icône seule (`cezame-icon-*`)** : `color`, `black`, `white`, `unicolor-purple`, `mono-purple`
  - **Lockup horizontal (`cezame-logo-horizontal-*`)** : `color-dark`, `color-purple`, `black`, `white`, `unicolor-purple`
  - **Lockup vertical (`cezame-logo-vertical-*`)** : `color-dark`, `color-purple`, `black`, `white`, `unicolor-purple`
  - **Texte seul (`cezame-wordmark-*`)** : `color-dark`, `color-purple`, `black`, `white`, `unicolor-purple` (avec les 3 traits au-dessus à droite du `A`)
- `svg/` — Les 20 mêmes déclinaisons au format SVG vectoriel (`fill-rule="evenodd"`).
- `favicons/` — Icônes carrées prêtes à l'emploi :
  - `favicon.ico` (multi-tailles 16x16, 32x32, 48x48)
  - `cezame-favicon-{32x32,64x64,180x180,512x512,1024x1024}.png` (fond transparent)
  - `cezame-app-icon-purple-{512x512,1024x1024}.png` (toucan blanc sur fond violet `#7B4FE2`, idéal pour icône d'app mobile ou avatar réseaux sociaux)
- `social/` — Visuels pour partage de liens et réseaux sociaux :
  - `cezame-og-light-1200x630.png` (OpenGraph clair sur `#FBFAF8`)
  - `cezame-og-purple-1200x630.png` (OpenGraph violet `#7B4FE2`)
  - `cezame-banner-1500x500.png` (Bannière LinkedIn / X / GitHub)

## Palette officielle

| Rôle | Couleur | Hex |
|---|---|---|
| Violet principal (marque / unicolor) | Violet | `#7B4FE2` |
| Violet corps toucan | Violet clair | `#855AE7` |
| Encre foncée (texte) | Indigo nuit | `#1E1836` |
| Cyan (aile / bec / trait) | Bleu ciel | `#92DCE2` |
| Vert (pattes / bec / queue) | Vert lime pastel | `#BBE896` |
| Corail (joue / bec / queue / trait) | Rose corail | `#F5A6A2` |
| Crème (visage / ventre) | Blanc chaud | `#FEF5EE` |

## Zone de protection & Tailles minimales

- **Zone de protection (Clear space)** : laisser un espace libre autour du logo égal à au moins la hauteur des **3 traits** (environ `15–20 %` de la hauteur totale du logo) sur tous les côtés.
- **Tailles minimales recommandées** :
  - **Lockup horizontal / vertical** : largeur minimale de `120 px` (écran) / `30 mm` (impression) pour préserver la lisibilité de *CEZAME*.
  - **Wordmark seul** : largeur minimale de `90 px` / `24 mm`.
  - **Icône toucan seule** : `24 px` minimum (en dessous, utiliser `favicons/favicon.ico` en 16×16).
- **Application mobile / Web (`frontend/assets/images/`)** : les icônes Expo (`icon.png`, `android-icon-foreground.png`, `android-icon-monochrome.png`, `favicon.png`, `splash-icon.png`) ont été mises à jour avec les marges de sécurité Android Adaptive Icon (~64 %).

## Recommandations d'usage

- **Web / App (fond clair)** : `cezame-logo-horizontal-color-dark` ou `cezame-wordmark-color-dark` dans une navbar.
- **Fond sombre ou coloré** : versions `*-white`.
- **Impression 1 couleur / gravure / tampon** : versions `*-black` ou `*-unicolor-purple` (pochoir à découpes négatives).
- **Réseaux sociaux / App Store / Play Store** : `favicons/cezame-app-icon-purple-1024x1024.png`.
