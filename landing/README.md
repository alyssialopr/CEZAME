# Cezame – Landing page (React)

Version React de la maquette « Landing page V3 (Pastel) », avec ses animations.

## Lancer le projet

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # version de production dans dist/
```

## Organisation

```
src/
  App.jsx              la page, section par section
  data.js              les textes et listes (menu, mondes, quiz, bas de page)
  index.css            tout le style et les animations
  sections/            Nav, Hero, Marquee, Problem, Worlds, HowItWorks, Quiz, FreeAndSchools, FinalCta, Footer
  components/          Button, Reveal, Phone, Floating (objets, nuages, rayons), icons
  components/screens/  les 3 écrans de l'app affichés dans les téléphones
  hooks/               useReveal (apparition au défilement), useScrolled (menu)
  assets/              Rico, logo, serrure, objets, nuages
```

## Effets et animations

- Menu fixe qui se solidifie quand on descend, liens soulignés au survol
- Haut de page : textes qui arrivent un par un, rayons qui tournent, Rico et les objets qui flottent et suivent la souris, nuages qui dérivent ; un clic sur Rico le fait sauter
- Bande de mots qui défile en boucle
- Tous les blocs apparaissent en glissant quand on descend (`<Reveal>`), avec un léger décalage dans les séries
- Cartes verrouillées : le cadenas s'ouvre au survol ou au toucher
- Portes : elles se soulèvent et Rico grandit au survol
- Téléphones : ils se redressent au survol de leur carte
- Quiz : barre de progression, confettis si c'est juste, la carte tremble si c'est faux
- Tout est coupé pour les personnes qui ont activé « réduire les animations »

## À brancher

- Liens des boutons App Store / Google Play, TikTok, Instagram, « Nous écrire » (`href="#"` pour l'instant)
- Le chiffre « 1 jeune sur 2 » est à sourcer
- Le 5ᵉ monde « Logement » est une supposition
