/* ============================================
   Réparation iPhone — Logique applicative
   Rendu dynamique depuis data/ressources.json
   ============================================ */

const ETAT = { data: null, recherche: '', filtre: 'tous' };

/* ---------- Helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const TYPE_LABEL = {
  video:   ['Vidéo',   't-video'],
  guide:   ['Guide',   't-guide'],
  cours:   ['Cours',   't-cours'],
  article: ['Article', 't-article'],
  pdf:     ['PDF',     't-pdf']
};

const CLASSE_NIVEAU = { vert: 'n-vert', bleu: 'n-bleu', orange: 'n-orange', rouge: 'n-rouge' };
const NOM_NIVEAU = { 0: 'Débutant', 1: 'Débutant', 2: 'Intermédiaire', 3: 'Avancé' };

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
  ));
}

function noteHTML(n) {
  if (n === undefined || n === null) return '';
  return `<span class="note">${n.toFixed ? n.toFixed(1).replace('.0', '') : n} / 5</span>`;
}

/* ---------- Rendu d'une carte ressource ---------- */
function carteRessource(r) {
  const [label, cls] = TYPE_LABEL[r.type] || ['Ressource', 't-guide'];
  const estFR = (r.langue || '').toUpperCase().startsWith('FR');
  const verif = r.verifie === true
    ? '<span class="verif">✓ vérifié</span>'
    : '<span class="verif partiel">◐ vérif. partielle</span>';

  return `
    <article class="card${r.alerte ? ' alerte' : ''}"
             data-type="${esc(r.type)}"
             data-modele="${esc(r.modele)}"
             data-titre="${esc((r.titre + ' ' + r.source + ' ' + r.modele).toLowerCase())}">
      <div class="card-top">
        <span class="tag ${cls}">${label}</span>
        <span class="lang${estFR ? ' fr' : ''}">${esc(r.langue)}</span>
        ${noteHTML(r.note)}
      </div>
      <h4><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.titre)}</a></h4>
      <div class="meta">
        ${r.duree   ? `<span>⏱ ${esc(r.duree)}</span>` : ''}
        ${r.modele  ? `<span>📱 ${esc(r.modele)}</span>` : ''}
      </div>
      <p class="pourquoi">${esc(r.pourquoi)}</p>
      <div class="src">
        <span>${esc(r.source || '')}</span>
        ${verif}
      </div>
    </article>`;
}

/* ---------- Page : parcours (index) ---------- */
function rendreParcours() {
  const cible = $('#parcours-conteneur');
  if (!cible || !ETAT.data) return;

  cible.innerHTML = ETAT.data.parcours.map(n => `
    <div class="niveau" data-niveau="${n.niveau}">
      <div class="niveau-head">
        <div class="niveau-num ${CLASSE_NIVEAU[n.couleur] || 'n-bleu'}">${n.niveau}</div>
        <div>
          <h3>${esc(n.titre)}</h3>
          <p class="obj">${esc(n.objectif)}</p>
        </div>
      </div>
      <div class="grid">${n.ressources.map(carteRessource).join('')}</div>
    </div>`).join('');

  appliquerFiltres();
}

/* ---------- Filtres + recherche ---------- */
function appliquerFiltres() {
  const q = ETAT.recherche.trim().toLowerCase();
  let visibles = 0;

  $$('.card[data-titre]').forEach(c => {
    const okType = ETAT.filtre === 'tous' || c.dataset.type === ETAT.filtre;
    const okQ = !q || c.dataset.titre.includes(q);
    const ok = okType && okQ;
    c.classList.toggle('hidden', !ok);
    if (ok) visibles++;
  });

  // Masquer un niveau entierement vide
  $$('.niveau').forEach(niv => {
    const restantes = $$('.card:not(.hidden)', niv).length;
    niv.classList.toggle('hidden', restantes === 0);
  });

  const compteur = $('#compteur');
  if (compteur) {
    compteur.textContent = q || ETAT.filtre !== 'tous'
      ? `${visibles} ressource${visibles > 1 ? 's' : ''} affichée${visibles > 1 ? 's' : ''}`
      : '';
  }
}

function initRecherche() {
  const input = $('#recherche');
  if (input) {
    input.addEventListener('input', e => {
      ETAT.recherche = e.target.value;
      appliquerFiltres();
    });
  }

  $$('.chip[data-filtre]').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip[data-filtre]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      ETAT.filtre = chip.dataset.filtre;
      appliquerFiltres();
    });
  });
}

/* ---------- Page : vidéos ---------- */
function rendreVideos() {
  const cible = $('#videos-conteneur');
  if (!cible || !ETAT.data) return;

  const videos = [];
  ETAT.data.parcours.forEach(n => {
    n.ressources.filter(r => r.type === 'video').forEach(r => videos.push({ ...r, niveau: n.niveau }));
  });
  videos.sort((a, b) => b.note - a.note || a.niveau - b.niveau);

  cible.innerHTML = videos.map((v, i) => `
    <article class="semaine">
      <div class="semaine-num">
        <div class="s">N°</div>
        <div class="n">${i + 1}</div>
      </div>
      <div>
        <h4><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.titre)}</a></h4>
        <p class="obj">
          ${esc(v.source)} · ${esc(v.duree)} · ${esc(v.modele)}
          · Niveau ${v.niveau} (${NOM_NIVEAU[v.niveau]}) · <strong style="color:var(--orange)">${v.note}/5</strong>
        </p>
        <p style="font-size:.88rem;color:var(--text-dim)">${esc(v.pourquoi)}</p>
      </div>
    </article>`).join('');
}

/* ---------- Page : guides ---------- */
function rendreGuides() {
  const cible = $('#guides-conteneur');
  if (!cible || !ETAT.data) return;

  const guides = [];
  ETAT.data.parcours.forEach(n => {
    n.ressources.filter(r => r.type === 'guide' || r.type === 'article').forEach(r => guides.push({ ...r, niveau: n.niveau }));
  });

  // Regrouper par modele
  const parModele = {};
  guides.forEach(g => {
    const cle = g.modele || 'Général';
    (parModele[cle] = parModele[cle] || []).push(g);
  });

  cible.innerHTML = Object.entries(parModele).map(([modele, liste]) => `
    <div class="niveau">
      <div class="niveau-head">
        <div class="niveau-num n-bleu" style="font-size:1rem">📱</div>
        <div><h3>${esc(modele)}</h3><p class="obj">${liste.length} guide${liste.length > 1 ? 's' : ''}</p></div>
      </div>
      <div class="grid">${liste.map(carteRessource).join('')}</div>
    </div>`).join('');
}

/* ---------- Page : outils ---------- */
function rendreOutils() {
  if (!ETAT.data) return;
  const o = ETAT.data.outils;

  const tableau = (arr) => `
    <div class="table-wrap"><table>
      <thead><tr><th>Article</th><th>Rôle</th><th>Prix</th><th>Fournisseur</th></tr></thead>
      <tbody>${arr.map(a => `
        <tr>
          <td><a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.article)}</a></td>
          <td>${esc(a.role)}</td>
          <td class="prix">${esc(a.prix)}</td>
          <td>${esc(a.fournisseur)}</td>
        </tr>`).join('')}</tbody>
    </table></div>`;

  const cA = $('#budget-a'); if (cA) cA.innerHTML = tableau(o.budgetA);
  const cB = $('#budget-b'); if (cB) cB.innerHTML = tableau(o.budgetB);

  const cP = $('#pieces');
  if (cP) cP.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Qualité</th><th>Prix</th><th>Note</th></tr></thead>
      <tbody>${o.pieces.map(p => `
        <tr><td><strong>${esc(p.qualite)}</strong></td>
            <td class="prix">${esc(p.prix)}</td>
            <td>${esc(p.note)}</td></tr>`).join('')}</tbody>
    </table></div>`;

  const cF = $('#fournisseurs');
  if (cF) cF.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Fournisseur</th><th>Zone</th><th>Fiabilité</th></tr></thead>
      <tbody>${o.fournisseurs.map(f => `
        <tr><td><strong>${esc(f.nom)}</strong></td>
            <td class="zone">${esc(f.zone)}</td>
            <td>${esc(f.fiabilite)}</td></tr>`).join('')}</tbody>
    </table></div>`;

  const cPi = $('#pieges');
  if (cPi) cPi.innerHTML = o.pieges.map(p => `
    <div class="alert"><span class="ico">⚠️</span><div><p>${esc(p)}</p></div></div>`).join('');
}

/* ---------- Page : plan 8 semaines ---------- */
function rendrePlan() {
  const cible = $('#plan-conteneur');
  if (!cible || !ETAT.data) return;

  cible.innerHTML = ETAT.data.plan8Semaines.map(s => `
    <div class="semaine">
      <div class="semaine-num"><div class="s">Sem.</div><div class="n">${s.semaine}</div></div>
      <div>
        <h4>${esc(s.titre)}</h4>
        <p class="obj">${esc(s.objectif)}</p>
        <ul>${s.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
        <div class="livrable">🎯 Livrable : ${esc(s.livrable)}</div>
      </div>
    </div>`).join('');
}

/* ---------- Page : ressources annexes + chaînes ---------- */
function rendreAnnexes() {
  if (!ETAT.data) return;

  const cR = $('#annexes-conteneur');
  if (cR) cR.innerHTML = ETAT.data.ressourcesAnnexes.map(r => `
    <article class="card">
      <div class="card-top">
        <span class="tag t-guide">${esc(r.type)}</span>
        <span class="lang${(r.langue||'').toUpperCase().startsWith('FR') ? ' fr' : ''}">${esc(r.langue)}</span>
        ${noteHTML(r.note)}
      </div>
      <h4><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.titre)}</a></h4>
      <p class="pourquoi">${esc(r.pourquoi)}</p>
      <div class="src"><span></span>${
        r.verifie === true ? '<span class="verif">✓ vérifié</span>'
        : '<span class="verif partiel">◐ vérif. partielle</span>'}</div>
    </article>`).join('');

  const cC = $('#chaines-conteneur');
  if (cC) cC.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Chaîne</th><th>Abonnés</th><th>Note</th><th>Pourquoi la suivre</th></tr></thead>
      <tbody>${ETAT.data.chaines.map(c => `
        <tr>
          <td><a href="${esc(c.url)}" target="_blank" rel="noopener"><strong>${esc(c.nom)}</strong></a></td>
          <td class="zone">${esc(c.abonnes)}</td>
          <td class="prix">${c.note}/5</td>
          <td>${esc(c.pourquoi)}</td>
        </tr>`).join('')}</tbody>
    </table></div>`;

  const cE = $('#ecartees-conteneur');
  if (cE) cE.innerHTML = ETAT.data.chainesEcartees.map(c => `
    <div class="alert"><span class="ico">🚫</span>
      <div><h4>${esc(c.nom)}</h4><p>${esc(c.raison)}</p></div></div>`).join('');

  const cAv = $('#avertissements-conteneur');
  if (cAv) cAv.innerHTML = ETAT.data.avertissements.map(a => `
    <div class="alert"><span class="ico">⚠️</span>
      <div><h4>${esc(a.titre)}</h4><p>${esc(a.texte)}</p></div></div>`).join('');
}

/* ---------- Init ---------- */
async function init() {
  try {
    const rep = await fetch('data/ressources.json');
    if (!rep.ok) throw new Error('HTTP ' + rep.status);
    ETAT.data = await rep.json();
  } catch (e) {
    console.error('Chargement des données impossible :', e);
    const avis = $('#erreur-donnees');
    if (avis) avis.classList.remove('hidden');
    return;
  }

  rendreParcours();
  rendreVideos();
  rendreGuides();
  rendreOutils();
  rendrePlan();
  rendreAnnexes();
  initRecherche();
}

document.addEventListener('DOMContentLoaded', init);
