/**
 * Liv Services — Avis clients après livraison
 * À coller dans une Google Sheet : Extensions > Apps Script (remplace tout le code présent)
 *
 * Onglet "Avis"   : rempli automatiquement (Date | Prénom | Note | Commentaire | Points | Référence | Appareil)
 * Onglet "Résumé" : note moyenne, nombre d'avis, répartition des notes (calculés tout seuls)
 * Email d'alerte  : envoyé au propriétaire de la Sheet pour chaque note de 1 ou 2 étoiles.
 */

const ONGLET_AVIS = "Avis";
const ONGLET_RESUME = "Résumé";
const ENTETES = ["Date", "Prénom", "Note", "Commentaire", "Points", "Référence", "Appareil"];
const ALERTE_SI_NOTE_MAX = 2; // mettre 0 pour ne jamais recevoir d'email

// À lancer UNE fois après avoir collé ce code (bouton Exécuter).
function installer() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const a = ss.getSheetByName(ONGLET_AVIS) || ss.insertSheet(ONGLET_AVIS);
  a.getRange(1, 1, 1, ENTETES.length).setValues([ENTETES]).setFontWeight("bold").setBackground("#0F3D2E").setFontColor("#F6F5EF");
  a.setFrozenRows(1);
  a.setColumnWidth(4, 420);
  a.getRange("D:E").setWrap(true);
  a.getRange("A:A").setNumberFormat("dd/MM/yyyy HH:mm");

  const r = ss.getSheetByName(ONGLET_RESUME) || ss.insertSheet(ONGLET_RESUME);
  r.clear();
  r.getRange("A1:B4").setValues([
    ["Note moyenne", "=IFERROR(ROUND(AVERAGE(Avis!C2:C),2),\"-\")"],
    ["Nombre d'avis", "=COUNT(Avis!C2:C)"],
    ["Avis des 7 derniers jours", "=COUNTIF(Avis!A2:A,\">=\"&(TODAY()-7))"],
    ["Moyenne 7 derniers jours", "=IFERROR(ROUND(AVERAGEIF(Avis!A2:A,\">=\"&(TODAY()-7),Avis!C2:C),2),\"-\")"],
  ]);
  r.getRange("A6:C6").setValues([["Étoiles", "Nombre", "%"]]).setFontWeight("bold");
  for (let s = 5; s >= 1; s--) {
    const row = 7 + (5 - s);
    r.getRange(row, 1, 1, 3).setValues([[s + " ★", "=COUNTIF(Avis!C2:C," + s + ")", "=IFERROR(B" + row + "/$B$2,0)"]]);
  }
  r.getRange("C7:C11").setNumberFormat("0%");
  r.getRange("A1:A4").setFontWeight("bold");
  r.setColumnWidth(1, 220);

  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
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
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
        "⚠ Avis " + note + "★ de " + prenom + (ref ? " (" + ref + ")" : ""),
        "Note : " + note + "/5\nPrénom : " + prenom + (ref ? "\nRéférence : " + ref : "") +
        (points ? "\nPoints : " + points : "") + "\n\nCommentaire :\n" + (commentaire || "(aucun)") +
        "\n\n" + SpreadsheetApp.getActiveSpreadsheet().getUrl());
    } catch (err) { /* l'avis reste enregistré même si l'email échoue */ }
  }
  return json_({ ok: true });
}
