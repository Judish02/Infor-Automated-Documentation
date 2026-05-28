// gen.js — DES-030 generator for LstCutOff (Pure XtendM3)
// Input:  ../02_Current_Target/DES020_Lst_CutOff_OrchestrationDesCommandes.docx
// Output: ../02_Current_Target/DES-030_LstCutOff_M3_OrchestrationDesCommandes_V1_0.docx
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat, TabStopType, TabStopPosition,
} = require('docx');

// ---- Variables extracted from the DES-020 -------------------------------
const WRICEF_ID = 'LstCutOff';
const NAME      = 'OrchestrationDesCommandes';
const SYSTEM    = 'M3';
const API       = 'EXT340MI-LstCutOff';
const VERSION   = '1.0';
const AUTHOR    = 'Motean Kenylen';
const DES020_DATE = '27/11/2025';
const TODAY     = new Date().toLocaleDateString('fr-FR');
const PROJECT   = 'Lynx';
const CLASS     = 'B'; // Pure XtendM3
const OUT_FILE  = `DES-030_${WRICEF_ID}_${SYSTEM}_${NAME}_V1_0.docx`;
const OUT_PATH  = path.join(__dirname, '..', '02_Current_Target', OUT_FILE);

// ---- Style helpers -------------------------------------------------------
const border = { style: BorderStyle.SINGLE, size: 4, color: '888888' };
const borders = { top: border, bottom: border, left: border, right: border };

const h1 = (txt) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 180 },
  children: [new TextRun({ text: txt, bold: true, size: 32 })],
});
const h2 = (txt) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: txt, bold: true, size: 26 })],
});
const p = (txt, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text: txt, ...opts })],
});
const li = (txt) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80 },
  children: [new TextRun(txt)],
});
const num = (txt) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  spacing: { after: 80 },
  children: [new TextRun(txt)],
});
const blank = () => new Paragraph({ children: [new TextRun('')] });

const cell = (txt, width, opts = {}) => new TableCell({
  borders,
  width: { size: width, type: WidthType.DXA },
  shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
  margins: { top: 100, bottom: 100, left: 140, right: 140 },
  children: (Array.isArray(txt) ? txt : [txt]).map(t =>
    typeof t === 'string'
      ? new Paragraph({ children: [new TextRun({ text: t, bold: opts.bold })] })
      : t
  ),
});

// A4 content width with 1" margins: 11906 - 2*1440 = 9026
const W = 9026;

// ---- Section 1: Document Control tables ---------------------------------
const tblVersions = new Table({
  width: { size: W, type: WidthType.DXA },
  columnWidths: [1400, 1900, 2200, 3526],
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell('Version', 1400, { fill: 'D5E8F0', bold: true }),
      cell('Date',    1900, { fill: 'D5E8F0', bold: true }),
      cell('Author',  2200, { fill: 'D5E8F0', bold: true }),
      cell('Description of Change', 3526, { fill: 'D5E8F0', bold: true }),
    ]}),
    new TableRow({ children: [
      cell(VERSION, 1400),
      cell(TODAY,   1900),
      cell(AUTHOR,  2200),
      cell('Création initiale du document de déploiement et de promotion.', 3526),
    ]}),
  ],
});

const tblReviewers = new Table({
  width: { size: W, type: WidthType.DXA },
  columnWidths: [3000, 3000, 3026],
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell('Name',     3000, { fill: 'D5E8F0', bold: true }),
      cell('Position', 3000, { fill: 'D5E8F0', bold: true }),
      cell('Role',     3026, { fill: 'D5E8F0', bold: true }),
    ]}),
    new TableRow({ children: [
      cell('À déterminer', 3000),
      cell('Architecte M3', 3000),
      cell('Reviewer', 3026),
    ]}),
    new TableRow({ children: [
      cell('À déterminer', 3000),
      cell('Chef de projet', 3000),
      cell('Approver', 3026),
    ]}),
  ],
});

// ---- Section 4: Deliverables table --------------------------------------
const tblDeliverables = new Table({
  width: { size: W, type: WidthType.DXA },
  columnWidths: [3200, 1600, 1500, 2726],
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell('Extension / Object name', 3200, { fill: 'D5E8F0', bold: true }),
      cell('New / Modified',          1600, { fill: 'D5E8F0', bold: true }),
      cell('Type',                    1500, { fill: 'D5E8F0', bold: true }),
      cell('Comments',                2726, { fill: 'D5E8F0', bold: true }),
    ]}),
    new TableRow({ children: [
      cell(`TRANSACTION-${API}.json`, 3200),
      cell('New',                     1600),
      cell('XtendM3 Transaction',     1500),
      cell('API XtendM3 exposée sur EXT340MI.', 2726),
    ]}),
  ],
});

// ---- Section 9: Approvals table -----------------------------------------
const tblApprovals = new Table({
  width: { size: W, type: WidthType.DXA },
  columnWidths: [2500, 2500, 2026, 2000],
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell('Nom',       2500, { fill: 'D5E8F0', bold: true }),
      cell('Rôle',      2500, { fill: 'D5E8F0', bold: true }),
      cell('Date',      2026, { fill: 'D5E8F0', bold: true }),
      cell('Signature', 2000, { fill: 'D5E8F0', bold: true }),
    ]}),
    new TableRow({ children: [
      cell(AUTHOR, 2500),
      cell('Rédacteur', 2500),
      cell(TODAY, 2026),
      cell('', 2000),
    ]}),
    new TableRow({ children: [
      cell('[Insérer]', 2500),
      cell('Architecte M3', 2500),
      cell('', 2026),
      cell('', 2000),
    ]}),
    new TableRow({ children: [
      cell('[Insérer]', 2500),
      cell('Chef de projet', 2500),
      cell('', 2026),
      cell('', 2000),
    ]}),
  ],
});

// ---- Document -----------------------------------------------------------
const doc = new Document({
  creator: AUTHOR,
  title: `DES-030 ${WRICEF_ID} ${NAME}`,
  description: `Guide de déploiement & promotion — ${API}`,
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '1F3864' },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: { default: new Header({ children: [
      new Paragraph({
        children: [
          new TextRun({ text: `DES-030 — ${WRICEF_ID} ${NAME}`, bold: true, size: 18 }),
          new TextRun({ text: `\tVersion ${VERSION}`, size: 18 }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      }),
    ]}) },
    footers: { default: new Footer({ children: [
      new Paragraph({
        children: [
          new TextRun({ text: `${WRICEF_ID} — Projet ${PROJECT}`, size: 18 }),
          new TextRun({ text: `\tPage `, size: 18 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
          new TextRun({ text: ` / `, size: 18 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      }),
    ]}) },
    children: [
      // Title block
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: `DES-030`, bold: true, size: 44, color: '1F3864' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: `GUIDE DE DÉPLOIEMENT & PROMOTION`, bold: true, size: 32, color: '1F3864' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
        children: [
          new TextRun({ text: `${WRICEF_ID} — ${NAME}`, bold: true, size: 28 }),
          new TextRun({ text: `\n${API} (XtendM3)`, size: 24, break: 1 }),
          new TextRun({ text: `\nProjet ${PROJECT} — CloudSuite M3 One ERP`, size: 22, break: 1 }),
        ],
      }),

      // 1. CONTROLE DU DOCUMENT
      h1('1. CONTROLE DU DOCUMENT'),
      h2('1.1 Suivi des versions'),
      tblVersions,
      blank(),
      h2('1.2 Relecture / Validation'),
      tblReviewers,
      blank(),

      // 2. INTRODUCTION & OBJECTIF
      h1('2. INTRODUCTION & OBJECTIF'),
      p(`Ce document décrit la procédure de déploiement de l'interface ${WRICEF_ID} (${NAME}) — implémentée sous forme d'une transaction XtendM3 ${API} — depuis l'environnement de DEV vers les environnements TEST puis PROD dans le cadre du projet ${PROJECT}.`),
      p(`L'API ${API} a pour rôle d'orchestrer les commandes en retournant, pour un client donné, la disponibilité de stock, les tournées triées par ordre de pertinence, ainsi que les prix et remises associés aux articles. Toutes les informations sont récupérées depuis M3.`),
      p(`Le présent guide contient les étapes chronologiques nécessaires à l'importation, l'activation, la validation et la promotion du composant. Il définit également les procédures de rollback en cas d'échec.`),

      // 3. PREREQUIS ET DEPENDANCES SYSTEME
      h1('3. PREREQUIS ET DEPENDANCES SYSTEME'),
      p(`Avant tout déploiement, vérifier les prérequis suivants :`),
      li(`Accès administrateur à l'environnement M3 cible (TEST puis PROD).`),
      li(`Accès aux Outils d'administration > XtendM3 dans M3 H5.`),
      li(`Droits d'écriture sur la table des transactions XtendM3.`),
      li(`Validation préalable de l'interface en environnement de DEV (cf. DES-020 LstCutOff v1).`),
      li(`Disponibilité de l'API EXT340MI dans l'environnement cible.`),
      p(`Dépendances applicatives :`),
      li(`Tables M3 référencées : OCUSMA (clients), DRS011 (routes), RODN (tournées), OOLINE / OOHEAD (commandes).`),
      li(`Programmes M3 : OIS100 (client), MMS200 (article), DRS010 (route).`),
      p(`Ce flux est une API XtendM3 synchrone : aucune souscription Event Hub n'est requise, et aucune vérification CMS042 / CMS045 n'est applicable.`),

      // 4. OBJETS LIVRABLES ET EXTENSIONS
      h1('4. OBJETS LIVRABLES ET EXTENSIONS'),
      p(`Le tableau ci-dessous liste l'ensemble des composants physiques à promouvoir :`),
      tblDeliverables,
      blank(),

      // 5. INSTRUCTIONS DE DEPLOIEMENT
      h1("5. INSTRUCTIONS DE DEPLOIEMENT ET D'INSTALLATION"),
      p(`Le déploiement de cette interface est de classe B (Pure XtendM3). Suivre les étapes chronologiques ci-dessous dans l'environnement cible.`),
      h2('5.1 Import de la transaction XtendM3'),
      num(`Se connecter à M3 H5 dans l'environnement cible avec un compte administrateur.`),
      num(`Naviguer vers : Outils d'administration > XtendM3.`),
      num(`Cliquer sur le bouton Importer.`),
      num(`Localiser le fichier livrable TRANSACTION-${API}.json fourni dans le pack de livraison.`),
      num(`Cliquer sur Import.`),
      num(`Confirmer l'import en cliquant sur Importer dans le message d'avertissement.`),
      h2('5.2 Activation de la transaction'),
      num(`Ouvrir la transaction nouvellement importée dans la liste XtendM3.`),
      num(`Aller dans l'onglet Settings.`),
      num(`Activer le contrôle Active.`),
      num(`Cliquer sur Save pour persister l'activation.`),
      h2('5.3 Vérification de la compilation'),
      num(`Vérifier que le statut de la transaction est passé à Active dans la liste XtendM3.`),
      num(`Contrôler l'absence d'erreurs de compilation dans les logs XtendM3.`),
      num(`Si une erreur de compilation est remontée, consulter le détail dans la console XtendM3 et corriger avant de poursuivre.`),

      // 6. VALIDATION & TESTS POST-DEPLOYMENT
      h1('6. VALIDATION & TESTS POST-DEPLOYMENT'),
      p(`Après le déploiement, exécuter les tests fonctionnels suivants pour valider la mise en service :`),
      h2('6.1 Test de l\'API avec un payload nominal'),
      num(`Invoquer l'API ${API} via Postman ou l'outil de test M3 avec les paramètres suivants : CONO, DIVI, CUNO d'un client de test connu et actif (statut=20).`),
      num(`Vérifier le code retour HTTP 200.`),
      num(`Vérifier la présence dans la réponse : tournées disponibles (P01–P05+), dates de livraison calculées, articles avec disponibilité de stock, prix et remises.`),
      h2('6.2 Test des cas d\'erreur'),
      num(`Invoquer l'API avec un CUNO inexistant — attendre un retour d'erreur métier explicite.`),
      num(`Invoquer l'API avec un client en statut différent de 20 — attendre un rejet contrôlé.`),
      num(`Invoquer l'API sans le dépôt principal du client (OKWHLO) — attendre la prise en compte du dépôt par défaut.`),
      h2('6.3 Validation par le métier'),
      num(`Faire valider le résultat par le référent métier OrchestrationDesCommandes du projet ${PROJECT}.`),
      num(`Documenter le PV de recette dans l'espace SharePoint du projet.`),

      // 7. PROCESSUS DE PROMOTION
      h1('7. PROCESSUS DE PROMOTION'),
      p(`La promotion de cette interface suit le flux standard DEV → TEST → PROD avec validation à chaque palier :`),
      h2('7.1 DEV → TEST'),
      num(`Le composant est validé fonctionnellement en DEV par le rédacteur (${AUTHOR}).`),
      num(`Export du fichier TRANSACTION-${API}.json depuis l'environnement DEV.`),
      num(`Import dans TEST en suivant la procédure de la section 5.`),
      num(`Exécution complète des tests de la section 6 en TEST.`),
      num(`Validation par le référent métier et signature du PV de recette TEST.`),
      h2('7.2 TEST → PROD'),
      num(`Sign-off formel du chef de projet sur la base du PV de recette TEST.`),
      num(`Planification de la fenêtre de déploiement PROD (créneau hors heures ouvrées).`),
      num(`Communication à l'équipe support et aux utilisateurs métier.`),
      num(`Import du composant en PROD en suivant la procédure de la section 5.`),
      num(`Exécution des tests de fumée de la section 6 en PROD.`),
      num(`Confirmation de la mise en service et clôture du ticket de déploiement.`),

      // 8. PROCEDURE DE ROLLBACK
      h1('8. PROCEDURE DE ROLLBACK'),
      p(`En cas d'échec du déploiement ou de comportement anormal détecté en post-déploiement, exécuter la procédure de retour arrière suivante :`),
      h2('8.1 Désactivation de la transaction'),
      num(`Se connecter à M3 H5 dans l'environnement cible.`),
      num(`Naviguer vers : Outils d'administration > XtendM3.`),
      num(`Ouvrir la transaction ${API}.`),
      num(`Dans l'onglet Settings, décocher le contrôle Active.`),
      num(`Cliquer sur Save.`),
      h2('8.2 Suppression de la transaction (rollback complet)'),
      num(`Si le rollback partiel (désactivation) ne suffit pas, supprimer la transaction depuis la liste XtendM3.`),
      num(`Confirmer la suppression dans le message de confirmation.`),
      num(`Vérifier qu'aucun appel résiduel n'est en cours sur ${API}.`),
      h2('8.3 Communication post-rollback'),
      num(`Notifier immédiatement le chef de projet et le référent métier.`),
      num(`Documenter la cause de l'échec dans le ticket de déploiement.`),
      num(`Planifier une session de correctif avant nouvelle tentative.`),

      // 9. APPROBATIONS & SIGNATURES
      h1('9. APPROBATIONS & SIGNATURES'),
      p(`Les signataires ci-dessous attestent de la validité de ce document et autorisent le déploiement en production :`),
      tblApprovals,
      blank(),
      p(`Fin du document.`, { italics: true }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT_PATH, buf);
  console.log(`Wrote: ${OUT_PATH}`);
  console.log(`Size:  ${buf.length} bytes`);
}).catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
