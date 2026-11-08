/**
 * Liv Services — Avis clients après livraison
 * À coller dans la Google Sheet « Liv Services – Avis clients » :
 * https://docs.google.com/spreadsheets/d/1ab0SSU17Bkf_hKNTx0qB705vs5wBOG-unhrA5CEGc-g/edit
 * Extensions > Apps Script (remplace tout le code présent)
 *
 * Onglet "Avis"   : rempli automatiquement (Date | Prénom | Note | Commentaire | Points | Référence | Appareil)
 * Onglet "Résumé" : note moyenne, nombre d'avis, répartition des notes (calculés tout seuls)
 * Email d'alerte  : envoyé au propriétaire de la Sheet pour chaque note de 1 ou 2 étoiles.
 */

const ONGLET_AVIS = "Avis";
const ENTETES = ["Date", "Prénom", "Note", "Commentaire", "Points", "Référence", "Appareil"];
const ALERTE_SI_NOTE_MAX = 2; // mettre 0 pour ne jamais recevoir d'email
// Adresse qui reçoit les emails d'alerte. Laisser "" pour utiliser le compte qui a déployé le script.
// Plusieurs adresses possibles, séparées par une virgule : "contact@exemple.com,moi@gmail.com"
const EMAIL_ALERTE = "";

function destinataire_() { return EMAIL_ALERTE || Session.getEffectiveUser().getEmail(); }

// À lancer UNE fois après avoir collé ce code (bouton Exécuter).
// La Sheet « Liv Services – Avis clients » est déjà prête (onglets Avis et Résumé) :
// cette fonction ne la modifie pas, elle autorise seulement l'écriture et les emails.
function installer() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const a = ss.getSheetByName(ONGLET_AVIS) || ss.insertSheet(ONGLET_AVIS);
  if (a.getLastRow() === 0) {
    a.getRange(1, 1, 1, ENTETES.length).setValues([ENTETES]).setFontWeight("bold").setBackground("#0F3D2E").setFontColor("#F6F5EF");
    a.setFrozenRows(1);
  }

  MailApp.sendEmail(destinataire_(),
    "Liv Services — avis clients activés",
    "Les avis clients seront enregistrés ici :\n" + ss.getUrl() +
    "\n\nVous recevrez un email pour chaque note de " + ALERTE_SI_NOTE_MAX + " étoile(s) ou moins.");
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
// Empêche qu'un commentaire commençant par = + - @ soit lu comme une formule
function texte_(s, max) {
  let t = String(s || "").replace(/[\u0000-\u0008\u000B-\u001F]/g, "").trim().slice(0, max);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

function doGet() {
  return json_({ ok: true, service: "Liv – avis clients" });
}

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, erreur: "format" }); }
  if (d.site) return json_({ ok: true }); // robot (champ caché rempli) : ignoré

  const note = Number(d.note);
  const prenom = texte_(d.prenom, 40);
  if (!(note >= 1 && note <= 5) || prenom.length < 2) return json_({ ok: false, erreur: "champs" });
  const commentaire = texte_(d.commentaire, 800);
  const points = texte_(d.points, 300);
  const ref = texte_(d.ref, 60);
  const appareil = texte_(d.appareil, 20);

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(ONGLET_AVIS) || ss.insertSheet(ONGLET_AVIS);
    sh.appendRow([new Date(), prenom, Math.round(note), commentaire, points, ref, appareil]);
  } finally { lock.releaseLock(); }

  if (note <= ALERTE_SI_NOTE_MAX) {
    try {
      MailApp.sendEmail(destinataire_(),
        "⚠ Avis " + note + "★ de " + prenom + (ref ? " (" + ref + ")" : ""),
        "Note : " + note + "/5\nPrénom : " + prenom + (ref ? "\nRéférence : " + ref : "") +
        (points ? "\nPoints : " + points : "") + "\n\nCommentaire :\n" + (commentaire || "(aucun)") +
        "\n\n" + SpreadsheetApp.getActiveSpreadsheet().getUrl());
    } catch (err) { /* l'avis reste enregistré même si l'email échoue */ }
  }
  return json_({ ok: true });
}
