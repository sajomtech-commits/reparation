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

  rendreCataloguePrix();

  const cF = $('#fournisseurs');
  if (cF) cF.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Fournisseur</th><th>Zone</th><th>Type</th><th>Fiabilité</th></tr></thead>
      <tbody>${o.fournisseurs.map(f => `
        <tr>
          <td><a href="${esc(f.url)}" target="_blank" rel="noopener"><strong>${esc(f.nom)}</strong></a>
            ${f.verifie === true ? '<br><span class="verif">✓ vérifié</span>' : '<br><span class="verif partiel">◐ partiel</span>'}</td>
          <td class="zone">${esc(f.zone)}</td>
          <td class="zone">${esc(f.type || '')}</td>
          <td>${esc(f.fiabilite)}</td>
        </tr>`).join('')}</tbody>
    </table></div>`;

  const cOA = $('#ou-acheter-conteneur');
  if (cOA) cOA.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Besoin</th><th>Où</th><th>Conseil</th></tr></thead>
      <tbody>${o.ouAcheterQuoi.map(x => `
        <tr><td><strong>${esc(x.besoin)}</strong></td>
            <td>${esc(x.ou)}</td>
            <td>${esc(x.conseil)}</td></tr>`).join('')}</tbody>
    </table></div>`;

  const cFM = $('#fournisseurs-morts');
  if (cFM) cFM.innerHTML = o.fournisseursMorts.map(f => `
    <div class="alert"><span class="ico">🚫</span>
      <div><h4>${esc(f.nom)}</h4><p>${esc(f.raison)}</p></div></div>`).join('');

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

/* ---------- Catalogue de prix vérifiés ---------- */
function rendreCataloguePrix() {
  const cat = ETAT.data && ETAT.data.outils.cataloguePrix;
  if (!cat) return;

  const MODELE_LABEL = {
    'iPhone 11': 'iPhone 11', 'iPhone 12': 'iPhone 12', 'iPhone 13': 'iPhone 13',
    'iPhone 14': 'iPhone 14', 'iPhone 15': 'iPhone 15'
  };

  // --- Écrans : tableau à double entrée modèle x qualité ---
  const cE = $('#catalogue-ecrans');
  if (cE) {
    const modeles = Object.keys(cat.ecrans);
    // Union des qualités, dans l'ordre du premier modèle le plus complet
    const toutes = [];
    modeles.forEach(m => cat.ecrans[m].forEach(e => {
      if (!toutes.includes(e.qualite)) toutes.push(e.qualite);
    }));
    cE.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Qualité</th>${modeles.map(m => `<th>${esc(MODELE_LABEL[m] || m)}</th>`).join('')}</tr></thead>
        <tbody>${toutes.map(q => `
          <tr>
            <td><strong>${esc(q)}</strong></td>
            ${modeles.map(m => {
              const e = cat.ecrans[m].find(x => x.qualite === q);
              return `<td class="prix">${e ? e.prix.toFixed(2) + ' €' : '—'}</td>`;
            }).join('')}
          </tr>`).join('')}</tbody>
      </table></div>`;
  }

  // --- Batteries ---
  const cB = $('#catalogue-batteries');
  if (cB) {
    const modeles = Object.keys(cat.batteries);
    const toutes = [];
    modeles.forEach(m => cat.batteries[m].forEach(e => {
      if (!toutes.includes(e.qualite)) toutes.push(e.qualite);
    }));
    cB.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Type</th>${modeles.map(m => `<th>${esc(m)}</th>`).join('')}</tr></thead>
        <tbody>${toutes.map(q => `
          <tr>
            <td><strong>${esc(q)}</strong></td>
            ${modeles.map(m => {
              const e = cat.batteries[m].find(x => x.qualite === q);
              return `<td class="prix">${e ? e.prix.toFixed(2) + ' €' : '—'}</td>`;
            }).join('')}
          </tr>`).join('')}</tbody>
      </table></div>`;
  }

  // --- Connecteurs ---
  const cC = $('#catalogue-connecteurs');
  if (cC) {
    cC.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Modèle</th><th>Prix</th><th>Note</th></tr></thead>
        <tbody>${Object.entries(cat.connecteurs).map(([m, p]) => `
          <tr><td><strong>${esc(m)}</strong></td>
              <td class="prix">${p.toFixed(2)} €</td>
              <td class="zone">${m === 'iPhone 11' || m === 'iPhone 12' ? 'Lightning' : 'Lightning (15 = USB-C sur la carte)'}</td></tr>`).join('')}
        </tbody>
      </table></div>`;
  }

  // --- Consommables ---
  const cK = $('#catalogue-consommables');
  if (cK) {
    cK.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Article</th><th>Prix</th></tr></thead>
        <tbody>${cat.consommables.map(c => `
          <tr><td>${esc(c.article)}</td><td class="prix">${c.prix.toFixed(2)} €</td></tr>`).join('')}
        </tbody>
      </table></div>`;
  }

  // --- Enquête : réparation à 60 € ---
  const e60 = ETAT.data.outils.enquete60euros;
  const cE60 = $('#enquete-60-conteneur');
  if (e60 && cE60) {
    const calc = e60.calcul;
    cE60.innerHTML = `
      <div class="note-box warn">
        <strong>La réponse en une phrase.</strong> ${esc(e60.reponseCourte)}
      </div>
      <p style="margin:16px 0">${esc(e60.explication)}</p>

      <h3 style="margin:26px 0 12px;font-size:1.05rem">Les 3 leviers possibles</h3>
      <div class="grid">
        ${e60.leviers.map(l => `
          <article class="card${l.honnete ? '' : ' alerte'}">
            <div class="card-top">
              <span class="tag ${l.honnete ? 't-article' : 't-video'}">
                ${l.honnete ? '✓ Pratique légitime' : '✗ Tromperie'}</span>
            </div>
            <h4>${esc(l.titre)}</h4>
            <p class="pourquoi">${esc(l.texte)}</p>
          </article>`).join('')}
      </div>

      <h3 style="margin:30px 0 12px;font-size:1.05rem">${esc(calc.titre)}</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Pièce utilisée</th><th>Coût d'achat</th><th>Marge sur une vente à 60 €</th><th>Verdict</th></tr></thead>
        <tbody>${calc.lignes.map(l => `
          <tr>
            <td><strong>${esc(l.piece)}</strong></td>
            <td>${l.cout.toFixed(2)} €</td>
            <td style="font-weight:700;color:${l.marge > 0 ? 'var(--vert)' : 'var(--rouge)'}">
              ${l.marge > 0 ? '+' : ''}${l.marge.toFixed(2)} €</td>
            <td>${l.possible ? '✅ Possible' : '❌ Impossible'}</td>
          </tr>`).join('')}</tbody>
      </table></div>
      <div class="note-box warn" style="margin-top:14px">
        <strong>Conclusion arithmétique.</strong> ${esc(calc.conclusion)}
      </div>

      <h3 style="margin:30px 0 12px;font-size:1.05rem">📊 ${esc(e60.tarifsMarche.titre)}</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Prestation</th><th>Prix constaté</th><th>Note</th></tr></thead>
        <tbody>${e60.tarifsMarche.lignes.map(l => `
          <tr><td><strong>${esc(l.prestation)}</strong></td>
              <td class="prix">${esc(l.prix)}</td>
              <td class="zone">${esc(l.note)}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="muted" style="font-size:.82rem;margin-top:8px">
        Source : <a href="${esc(e60.tarifsMarche.url)}" target="_blank" rel="noopener">${esc(e60.tarifsMarche.source)}</a>
      </p>

      <h3 style="margin:30px 0 12px;font-size:1.05rem">🛡️ Comment se protéger</h3>
      ${e60.commentSeProteger.map(c => `
        <div class="alert" style="border-left-color:var(--vert)">
          <span class="ico">✓</span><div><p>${esc(c)}</p></div>
        </div>`).join('')}

      <div class="note-box" style="margin-top:18px">
        <strong>🎯 À retenir.</strong> ${esc(e60.aRetenir)}
      </div>`;
  }

  // --- Batterie Apple originale iPhone 12 Pro ---
  const b12 = ETAT.data.outils.batterieOriginale12Pro;
  const cB12 = $('#batterie-12-pro-conteneur');
  if (b12 && cB12) {
    const vraie = b12.options.filter(o => o.qualite.includes('Apple'));
    const compat = b12.options.filter(o => !o.qualite.includes('Apple'));
    const carte = o => `
      <article class="card${o.recommande ? ' alerte' : ''}">
        <div class="card-top">
          <span class="tag ${o.qualite.includes('Apple') ? 't-guide' : 't-video'}">
            ${o.qualite.includes('Apple') ? 'Apple authentique' : 'Compatible'}</span>
          ${o.sante ? `<span class="lang">Santé ${esc(o.sante)}</span>` : ''}
          ${o.recommande ? '<span class="lang fr">⭐ Meilleur prix Apple</span>' : ''}
        </div>
        <h4><a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.qualite)}</a></h4>
        <div class="meta" style="font-size:1.25rem;font-weight:800;color:var(--vert)">
          ${o.prix.toFixed(2)} €
          ${o.prixBarre ? `<span style="font-size:.85rem;color:var(--text-faint);text-decoration:line-through;font-weight:400">${o.prixBarre.toFixed(2)} €</span>` : ''}
        </div>
        <p class="pourquoi">${esc(o.description)}</p>
        <div class="src"><span>${esc(o.fournisseur)}</span><span class="verif">✓ prix vérifié</span></div>
      </article>`;

    cB12.innerHTML = `
      <div class="note-box warn">
        <strong>⚠️ Le piège du mot « originale ».</strong> ${esc(b12.avertissement)}
      </div>
      <h3 style="margin:22px 0 12px;font-size:1.05rem">🍎 Vraies batteries Apple</h3>
      <div class="grid">${vraie.map(carte).join('')}</div>
      <h3 style="margin:28px 0 12px;font-size:1.05rem">🔧 Compatibles (PAS de l'Apple)</h3>
      <div class="grid">${compat.map(carte).join('')}</div>
      <div class="note-box">
        <strong>🎯 Verdict.</strong> ${esc(b12.verdict)}
      </div>
      <div class="note-box">
        <strong>🔬 Méthode.</strong> ${esc(b12.methode)}
      </div>`;
  }

  // --- Comparaison multi-fournisseurs ---
  const cm = cat.comparaisonMulti;
  if (cm) {
    const rendre = (id, lignes) => {
      const el = $(id);
      if (!el) return;
      const fmt = (v, ht) => v === null || v === undefined
        ? '<span class="muted">—</span>'
        : `<span class="prix">${v.toFixed(2)} €</span>${ht ? '<br><span class="zone" style="font-size:.72rem">HT</span>' : ''}`;
      el.innerHTML = `
        <div class="table-wrap"><table>
          <thead><tr>
            <th>Pièce</th>
            <th>iFixShop<br><span style="font-weight:400;text-transform:none">TTC</span></th>
            <th>world-itech<br><span style="font-weight:400;text-transform:none">TTC</span></th>
            <th>Pieces2Mobile<br><span style="font-weight:400;text-transform:none">HT</span></th>
            <th>MobileSentrix<br><span style="font-weight:400;text-transform:none">HT</span></th>
          </tr></thead>
          <tbody>${lignes.map(l => `
            <tr>
              <td><strong>${esc(l.piece)}</strong></td>
              <td>${fmt(l.iFixShop, false)}</td>
              <td>${fmt(l.worldItech, false)}</td>
              <td>${fmt(l.pieces2mobileHT, true)}</td>
              <td>${fmt(l.mobileSentrixHT, true)}</td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    };
    rendre('#comparaison-multi-13', cm.iphone13);
    rendre('#comparaison-multi-11', cm.iphone11);
  }

  // --- Comparaison Apple Original ---
  const cA = $('#comparaison-apple');
  if (cA) {
    cA.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr><th>Fournisseur</th><th>Produit</th><th>Prix</th></tr></thead>
        <tbody>${cat.comparaisonApple.map(c => `
          <tr>
            <td><a href="${esc(c.url)}" target="_blank" rel="noopener"><strong>${esc(c.fournisseur)}</strong></a></td>
            <td>${esc(c.produit)}</td>
            <td class="prix">${c.prix.toFixed(2)} €</td>
          </tr>`).join('')}</tbody>
      </table></div>`;
  }
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
