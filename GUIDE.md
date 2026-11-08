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

## 2. Google Sheet pour recevoir les avis (≈ 10 min, une seule fois)
Tout se fait avec le compte **contact@livservice.com**, dans une fenêtre où **lui seul** est connecté (navigation privée par exemple). Avec plusieurs comptes Google connectés en même temps, Apps Script refuse le déploiement (« Vous n'avez pas l'autorisation d'effectuer cette action »).

1. Ouvrez la Sheet « Liv Services – Avis clients » partagée avec contact@, puis **Fichier → Créer une copie**. Nommez-la « Liv Services – Avis clients » et rangez-la dans le Drive de l'entreprise. La copie (onglets Résumé et Avis) appartient alors à contact@.
2. Dans la copie : **Extensions → Apps Script**. Effacez le code présent, collez tout `Code.gs`, **Enregistrer**. Renommez le projet « Liv – Avis clients ».
3. Choisissez la fonction **installer** → **Exécuter** → acceptez les autorisations (« Paramètres avancés → Accéder au projet (non sécurisé) » → **Autoriser**). Un email de test arrive sur contact@livservice.com.
4. **Déployer → Nouveau déploiement** → engrenage → **Application Web**
   - Exécuter en tant que : **Moi** (contact@livservice.com)
   - Qui a accès : **Tout le monde**. Si seule l'option « Toute personne de livservice.com » existe, l'administrateur Google Workspace doit autoriser le partage public des applications Web, sinon les clients ne pourront pas envoyer d'avis.
   → **Déployer**, puis copiez l'URL (elle se termine par `/exec`).
5. Collez l'URL dans `scriptUrl` de `index.html`, sur GitHub (crayon ✏️ → **Commit changes**). Déjà fait : le site est branché sur le script du compte contact@livservice.com.

Les emails d'alerte (avis à 1 ou 2 étoiles) partent vers `EMAIL_ALERTE`, réglé sur contact@livservice.com dans `Code.gs`.

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
