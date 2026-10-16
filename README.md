# Réparation iPhone — Formations gratuites en français

Site statique qui indexe les meilleures ressources **gratuites et vérifiées** pour apprendre
à réparer un iPhone (11 → 15) en partant de zéro.

## Contenu

| Page | Contenu |
|---|---|
| `index.html` | Parcours complet niveau 0 → avancé (32 ressources), filtres et recherche |
| `videos.html` | Playlist ordonnée (12 vidéos) + 10 chaînes FR + 4 chaînes écartées |
| `guides.html` | Guides iFixit FR pas à pas, regroupés par modèle |
| `plan.html` | Plan de formation semaine 1 à 8, avec livrable par semaine |
| `outils.html` | Matériel, prix sourcés, échelle de qualité des pièces, fournisseurs |
| `ressources.html` | Cours, blogs, ateliers, communautés + les pièges |

## Lancement local

Le site charge ses données via `fetch()`, ce qui ne fonctionne pas en `file://`.
Lancez un petit serveur :

```bash
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Structure

```
├── index.html, videos.html, guides.html, plan.html, outils.html, ressources.html
├── css/style.css          Thème sombre responsive, aucune dépendance
├── js/app.js              Rendu dynamique depuis le JSON
└── data/ressources.json   Source unique de toutes les données
```

Pour modifier le contenu, éditez **uniquement** `data/ressources.json` — les pages se
régénèrent automatiquement.

## Méthode de vérification

- Toutes les URLs testées automatiquement par requête HTTP réelle
- Les vidéos confirmées individuellement via l'API **oEmbed** de YouTube (titre + chaîne réels)
- Les prix extraits des pages produit (HTML/JSON/API Shopify)
- **Aucune URL inventée** — les liens non confirmés sont marqués « vérification partielle »

**Résultat du dernier test : 64 URLs sur 65 répondent en HTTP 200.**
Le seul échec (Repair Café) est un blocage anti-robot Cloudflare, pas un lien mort.

## Périmètre

iPhone uniquement (11 → 15). Les guides Samsung/Xiaomi ne sont pas inclus.

## Mentions

- Les ressources appartiennent à leurs auteurs respectifs. Ce site est un index pédagogique sans affiliation.
- Aucun PDF constructeur n'est hébergé : les liens renvoient vers les sources officielles.
- Aucun lien affilié, aucune commission.
- Notes /5 : évaluations documentées (format, régularité, clarté annoncée), et non des tests de visionnage complet.

## Déploiement

Publié via GitHub Pages depuis la branche `main`.
