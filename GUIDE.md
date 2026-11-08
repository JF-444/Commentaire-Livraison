# Avis clients Liv Services – Guide

Site : **https://jf-444.github.io/Commentaire-Livraison/**

Le client note sa livraison (1 à 5 étoiles), donne son prénom, écrit un commentaire, puis **glisse la moto** pour envoyer. Un écran « Merci… à bientôt » s'affiche ensuite. Tous les avis arrivent dans une Google Sheet.

---

## 1. Ajouter les photos (livreurs en action, livraisons)
Dans le dépôt GitHub, ouvrez le dossier **photos** → **Add file → Upload files**, et glissez vos photos avec **exactement** ces noms :

| Nom du fichier | Idée de photo |
|---|---|
| `livreur-1.jpg` | Livreur sur sa moto (sert aussi de fond à l'en-tête) |
| `livraison-1.jpg` | Remise d'une commande à un client |
| `livreur-2.jpg` | Livreur en route dans Yaoundé |
| `livraison-2.jpg` | Sac / colis Liv |
| `livreur-3.jpg` | L'équipe |
| `livraison-3.jpg` | Client satisfait |

- `.jpg`, `.jpeg`, `.png` ou `.webp` fonctionnent tous.
- Vous n'êtes pas obligé de tout mettre : les photos absentes sont ignorées. Sans aucune photo, le site garde l'illustration de la moto.
- Pour changer les légendes : dans `index.html`, partie `photos:` en haut du fichier.
- Gardez des photos légères (moins de 500 Ko chacune) pour que le site s'ouvre vite sur mobile.
- Demandez l'accord des personnes qui apparaissent sur les photos.

## 2. Google Sheet pour recevoir les avis (≈ 10 min, une seule fois)
1. Créez une **nouvelle Google Sheet** (ex : « Liv – Avis clients »).
2. **Extensions → Apps Script**. Effacez le code, collez tout `Code.gs`, **Enregistrer**.
3. Choisissez la fonction **installer** → **Exécuter** → acceptez les autorisations. Les onglets **Avis** et **Résumé** sont créés et vous recevez un email de test.
4. **Déployer → Nouveau déploiement** → engrenage → **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   → **Déployer**, puis copiez l'URL (elle se termine par `/exec`).
5. Sur GitHub, ouvrez `index.html` → crayon ✏️ → collez l'URL entre les guillemets de `scriptUrl: ""` → **Commit changes**.

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
