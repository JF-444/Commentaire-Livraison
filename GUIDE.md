# Avis clients Liv Services – Guide

Site : **https://jf-444.github.io/Commentaire-Livraison/**

Le client note sa livraison (1 à 5 étoiles), donne son prénom, écrit un commentaire, puis **glisse la moto** pour envoyer. Un écran « Merci… à bientôt » s'affiche ensuite. Tous les avis arrivent dans une Google Sheet.

---

## 1. Les photos du haut de page
Les 3 photos sont dans le dossier **photos** et défilent toutes seules en haut du site (une toutes les 4,5 secondes) :
`livraison-1.jpg` (livreur à la porte), `livreur-1.jpg` (livreur, sac Liv eats), `livraison-2.jpg` (remise du sac + app).

- **Ajouter une photo** : déposez-la dans `photos/` (moins de 500 Ko, format vertical idéal), puis ajoutez une ligne dans `photos:` en haut de `index.html`, ex : `{ src: "photos/livreur-2.jpg", cadrage: "50% 30%" },`
- **Cadrage** : la partie de la photo qui reste visible. `"50% 30%"` = centre, un peu vers le haut (pour garder les visages).
- **Vitesse** : `delaiPhoto` (en millisecondes).

## 2. Google Sheet pour recevoir les avis (≈ 5 min, une seule fois)
La Sheet est déjà créée dans votre Google Drive, avec les onglets **Résumé** et **Avis** :
https://docs.google.com/spreadsheets/d/1ab0SSU17Bkf_hKNTx0qB705vs5wBOG-unhrA5CEGc-g/edit

1. Ouvrez-la, puis **Extensions → Apps Script**. Effacez le code, collez tout `Code.gs`, **Enregistrer**.
2. Choisissez la fonction **installer** → **Exécuter** → acceptez les autorisations (« Paramètres avancés → Accéder au projet » si un avertissement apparaît). Vous recevez un email de test.
3. **Déployer → Nouveau déploiement** → engrenage → **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   → **Déployer**, puis copiez l'URL (elle se termine par `/exec`).
4. Sur GitHub, ouvrez `index.html` → crayon ✏️ → collez l'URL entre les guillemets de `scriptUrl: ""` → **Commit changes**.

> Tant que `scriptUrl` est vide, le site fonctionne en **mode démo** : l'écran Merci s'affiche mais rien n'est enregistré.

## 3. Le message WhatsApp du lendemain
Ajoutez le prénom du client dans le lien (`?p=`) : le champ prénom sera déjà rempli.
Vous pouvez aussi ajouter la référence de la commande (`&ref=`) pour la retrouver dans la Sheet.

```
Bonjour Aïcha 👋
Merci d'avoir été livrée par Liv Services hier !
Comment ça s'est passé ? Donnez-nous votre avis en 30 secondes, il nous aide à améliorer notre service :
https://jf-444.github.io/Commentaire-Livraison/?p=Aïcha&ref=LIV-1234
À bientôt 🛵
```

## 4. Lire les avis
- Onglet **Avis** : une ligne par avis (date, prénom, note, commentaire, points cochés, référence, téléphone ou ordinateur).
- Onglet **Résumé** : note moyenne, nombre d'avis, moyenne des 7 derniers jours, répartition des étoiles.
- **Email automatique** pour chaque avis à 1 ou 2 étoiles, pour réagir vite (réglable avec `ALERTE_SI_NOTE_MAX` dans `Code.gs`).

## Si vous modifiez `Code.gs` plus tard
Apps Script → **Déployer → Gérer les déploiements** → crayon → Version : **Nouvelle version** → Déployer. L'URL ne change pas.
