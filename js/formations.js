/* ============================================
   Page Formations CPF — rendu
   ============================================ */

(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const esc = str => String(str ?? '').replace(/[&<>"']/g, m => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
  ));
  const eur = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  async function init() {
    let d;
    try {
      const r = await fetch('data/formations.json');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      d = await r.json();
    } catch (e) {
      console.error('Chargement formations impossible :', e);
      const av = $('#erreur-donnees');
      if (av) av.classList.remove('hidden');
      return;
    }

    rendreRegles(d.reglesCles);
    rendreCertifications(d.certifications);
    rendreSimulateur(d.simulateur);
    rendreFormations(d.formations);
    rendreVAE(d.vae);
    rendrePieges(d.piegesCPF);
  }

  /* ---------- Règles clés ---------- */
  function rendreRegles(regles) {
    const el = $('#regles-cles');
    if (!el) return;
    el.innerHTML = regles.map(r => `
      <div class="alert" style="border-left-color:var(--orange)">
        <span class="ico">${esc(r.icone)}</span>
        <div>
          <h4>${esc(r.titre)}</h4>
          <p>${esc(r.texte)}</p>
          <p style="margin-top:8px;font-size:.8rem">
            Source : <a href="${esc(r.source)}" target="_blank" rel="noopener">${esc(r.sourceNom)}</a>
          </p>
        </div>
      </div>`).join('');
  }

  /* ---------- Certifications ---------- */
  function rendreCertifications(certs) {
    const el = $('#certifications');
    if (!el) return;

    el.innerHTML = `
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Code</th><th>Titre</th><th>État</th><th>Échéance</th>
          <th>Niveau</th><th>CPF aujourd'hui</th>
        </tr></thead>
        <tbody>${certs.map(c => {
          const active = c.etat === 'Active';
          return `
          <tr>
            <td><a href="${esc(c.url)}" target="_blank" rel="noopener"><strong>${esc(c.code)}</strong></a></td>
            <td>${esc(c.titre)}<br><span class="zone">${esc(c.certificateur)}</span></td>
            <td style="font-weight:700;color:${active ? 'var(--vert)' : 'var(--rouge)'}">
              ${active ? '✅ Active' : '❌ Inactive'}</td>
            <td class="zone">${esc(c.echeance)}</td>
            <td class="zone">${esc(c.niveau)}</td>
            <td style="font-weight:600;color:${c.cpf ? 'var(--vert)' : 'var(--rouge)'}">
              ${c.cpf ? 'Finançable' : 'NON finançable'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
      <div style="margin-top:22px">
        ${certs.map(c => `
          <div class="card" style="margin-bottom:12px${c.etat !== 'Active' ? ';border-left:3px solid var(--rouge)' : ';border-left:3px solid var(--vert)'}">
            <div class="card-top">
              <span class="tag ${c.etat === 'Active' ? 't-article' : 't-video'}">${esc(c.code)}</span>
              <span class="lang">Niveau ${esc(c.niveau)}</span>
            </div>
            <h4>${esc(c.titre)}</h4>
            <p class="pourquoi">${esc(c.note)}</p>
          </div>`).join('')}
      </div>`;
  }

  /* ---------- Simulateur de reste à charge ---------- */
  function rendreSimulateur(sim) {
    const el = $('#simulateur');
    if (!el) return;

    el.innerHTML = `
      <p style="margin-bottom:20px">${esc(sim.intro)}</p>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Cas concret</th><th>Prix affiché</th><th>Plafond CPF</th>
          <th>Reste à charge</th><th>Détail</th>
        </tr></thead>
        <tbody>${sim.scenarios.map(s => {
          if (s.prix === 0) {
            return `<tr>
              <td><strong>${esc(s.cas)}</strong></td>
              <td>Gratuit</td><td>—</td>
              <td class="prix" style="color:var(--vert)">0 €</td>
              <td>${esc(s.resteEmploi || '')}</td></tr>`;
          }
          const couvert = Math.min(s.prix, s.plafond);
          const reste = s.prix - couvert + s.paiement;
          return `<tr>
            <td><strong>${esc(s.cas)}</strong></td>
            <td>${eur(s.prix)}</td>
            <td>${eur(s.plafond)}</td>
            <td style="font-weight:800;color:var(--rouge)">${eur(reste)}</td>
            <td class="zone">${eur(couvert)} pris par le CPF + ${eur(s.paiement)} de participation</td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
      <div class="note-box warn" style="margin-top:18px">
        <strong>Ce que ça veut dire.</strong> Pour la microsoudure à 4 500 €, même avec un solde CPF plein,
        vous paierez <strong>3 150 € de votre poche</strong> (plafond 1 500 € + 150 € de participation).
        L'alternance reste la seule voie réellement gratuite.
      </div>`;
  }

  /* ---------- Formations ---------- */
  function rendreFormations(list) {
    const el = $('#formations-conteneur');
    if (!el) return;

    el.innerHTML = list.map(f => `
      <article class="card" style="margin-bottom:14px${f.alerte ? ';border-left:3px solid var(--rouge)' : ''}${f.recommande ? ';border-left:3px solid var(--vert)' : ''}">
        <div class="card-top">
          <span class="tag ${f.certification.includes('ACTIVE') ? 't-article' : 't-video'}">
            ${f.certification.includes('ACTIVE') ? 'Titre actif' : (f.certification.includes('INACTIVE') ? '⚠️ Inactive' : 'Non certifiante')}
          </span>
          <span class="lang">${esc(f.lieu)}</span>
          <span class="note">${esc(f.prix)}</span>
        </div>
        <h4><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.intitule)}</a></h4>
        <div class="meta">
          <span>🏛 ${esc(f.organisme)}</span>
          <span>⏱ ${esc(f.duree)}</span>
          <span>📜 ${esc(f.certification)}</span>
        </div>
        <p class="pourquoi"><strong>Contenu :</strong> ${esc(f.pedagogie)}</p>
        <p class="pourquoi"><strong>Organisme :</strong> ${esc(f.organisme === 'Réseau Ducretet' ? f.cpf : f.organisme)}</p>
        ${f.cpf ? `<p class="pourquoi" style="color:${f.alerte ? 'var(--rouge)' : 'var(--text-dim)'}">
          <strong>CPF :</strong> ${esc(f.cpf)}</p>` : ''}
        ${f.urlFinancement ? `<div class="src"><a href="${esc(f.urlFinancement)}" target="_blank" rel="noopener">Page financement détaillée →</a></div>` : ''}
      </article>`).join('');
  }

  /* ---------- VAE ---------- */
  function rendreVAE(v) {
    const el = $('#vae-conteneur');
    if (!el) return;
    el.innerHTML = `
      <div class="note-box">
        <strong>${esc(v.resume)}</strong>
      </div>
      <div class="table-wrap" style="margin-top:16px"><table>
        <thead><tr><th>Conditions</th><th>Détail</th></tr></thead>
        <tbody>
          ${v.conditions.map(c => `<tr><td colspan="2">✓ ${esc(c)}</td></tr>`).join('')}
          <tr><td><strong>Durée</strong></td><td>${esc(v.duree)}</td></tr>
          <tr><td><strong>Financement</strong></td><td>${esc(v.fait)}</td></tr>
        </tbody>
      </table></div>
      <div class="note-box warn" style="margin-top:14px">${esc(v.alerte)}</div>
      <p style="margin-top:14px">
        <a href="${esc(v.url)}" target="_blank" rel="noopener" class="btn btn-ghost">Voir la VAE RNCP41732 →</a>
      </p>`;
  }

  /* ---------- Pièges ---------- */
  function rendrePieges(list) {
    const el = $('#pieges-cpf');
    if (!el) return;
    el.innerHTML = list.map(p => `
      <div class="alert">
        <span class="ico">🚫</span>
        <div><h4>${esc(p.titre)}</h4><p>${esc(p.texte)}</p></div>
      </div>`).join('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
