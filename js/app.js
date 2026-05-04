/**
 * app.js
 * ----------------------------------------------------
 * UI logika kvietimų sąrašui:
 *  - duomenų fetch iš JSON / API
 *  - kvietimų kortelių generavimas
 *  - filtravimas pagal būseną
 *  - tuščia būsena
 *
 * Verslo logika:
 *  - NAUDOJA TIK getInvitationStatus() iš status.js
 */

// === KONFIGŪRACIJA ===========================================================
const DATA_URL = 'data/kvietimai.json';

// === ELEMENTAI ===============================================================
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');

// === DUOMENŲ UŽKROVIMAS ======================================================
fetch(DATA_URL)
  .then(res => {
    if (!res.ok) throw new Error('Nepavyko užkrauti kvietimų duomenų');
    return res.json();
  })
  .then(renderInvitations)
  .catch(err => {
    console.error(err);
    showEmptyState(
      'Nepavyko užkrauti duomenų',
      'Pabandykite vėliau arba susisiekite su administratoriumi.'
    );
  });

// === RENDER ================================================================
function renderInvitations(invitations) {
  listEl.innerHTML = '';

  invitations.forEach(inv => {
    const start = new Date(inv.start);
    const end = new Date(inv.end);

    const status = getInvitationStatus(start, end);

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.status = status.status;

    card.innerHTML = `
      <span class="badge ${status.status}">${status.label}</span>

      <div class="title">${inv.pavadinimas}</div>

      <div class="dates">
        ${inv.start} → ${inv.end}
      </div>

      <div class="remaining ${status.variant || ''}">
        ${status.info}
      </div>

      <div class="desc">
        ${inv.aprasymas}
      </div>

      ${
        status.status === 'open'
          ? `<a class="btn btn-primary" href="kvietimas.html?id=${inv.id}">
               Peržiūrėti kvietimą
             </a>`
          : `<div class="btn btn-disabled">
               ${status.status === 'planned' ? 'Dar nepaskelbtas' : 'Užbaigtas'}
             </div>`
      }
    `;

    listEl.appendChild(card);
  });

  // po render – taikome filtrą
  applyFilter('all');
}

// === FILTRAVIMAS =============================================================
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

function applyFilter(filter) {
  let visibleCount = 0;

  document.querySelectorAll('.card').forEach(card => {
    const show = (filter === 'all' || card.dataset.status === filter);
    card.style.display = show ? 'flex' : 'none';
    if (show) visibleCount++;
  });

  emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
}

// === TUŠČIA BŪSENA ===========================================================
function showEmptyState(title, message) {
  listEl.innerHTML = '';
  emptyEl.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
  `;
  emptyEl.style.display = 'block';
}
