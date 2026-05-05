(function () {
  'use strict';

  var DATA_URL = 'data/kvietimai.json';

  var state = {
    invitations: [],
    activeFilter: 'all'
  };

  var listEl = document.getElementById('invitationsList');
  var emptyEl = document.getElementById('emptyState');
  var errorEl = document.getElementById('errorState');
  var summaryEl = document.getElementById('resultsSummary');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));

  function formatDate(value) {
    if (!value) return '–';

    return new Intl.DateTimeFormat('lt-LT', {
      dateStyle: 'long'
    }).format(new Date(value + 'T00:00:00'));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadInvitations() {
    return fetch(DATA_URL, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        return response.json();
      })
      .then(function (data) {
        // API keitimui pakanka užtikrinti, kad grįžtų masyvas arba { kvietimai: [...] }.
        state.invitations = Array.isArray(data) ? data : (data.kvietimai || []);
        render();
      })
      .catch(function (error) {
        console.error('Nepavyko įkelti kvietimų:', error);
        errorEl.hidden = false;
        summaryEl.textContent = 'Duomenų įkelti nepavyko.';
      });
  }

  function getFilteredInvitations() {
    return state.invitations.filter(function (item) {
      var status = window.getInvitationStatus(item.start, item.end);

      return state.activeFilter === 'all' || status.key === state.activeFilter;
    });
  }

  function render() {
    var items = getFilteredInvitations();

    listEl.innerHTML = '';
    errorEl.hidden = true;
    emptyEl.hidden = items.length > 0;

    summaryEl.textContent = 'Rodoma: ' + items.length + ' iš ' + state.invitations.length + ' kvietimų.';

    items.forEach(function (item) {
      listEl.insertAdjacentHTML('beforeend', renderCard(item));
    });
  }

  function renderCard(item) {
    var status = window.getInvitationStatus(item.start, item.end);
    var lastDayBadge = status.isLastDay
      ? '<span class="last-day-badge">PASKUTINĖ DIENA</span>'
      : '';

    var daysText = status.key === 'open'
      ? (status.isLastDay ? 'Baigiasi šiandien' : 'Liko ' + status.daysLeft + ' d.')
      : status.message;

    return '' +
      '<article class="invitation-card">' +
        '<div class="card-topline">' +
          '<span class="status-pill ' + status.cssClass + '">' + escapeHtml(status.label) + '</span>' +
          lastDayBadge +
        '</div>' +
        '<h3>' + escapeHtml(item.pavadinimas) + '</h3>' +
        '<p>' + escapeHtml(item.aprašymas) + '</p>' +
        '<dl class="card-meta">' +
          '<div><dt>Kodas</dt><dd>' + escapeHtml(item.id) + '</dd></div>' +
          '<div><dt>Pradžia</dt><dd>' + formatDate(item.start) + '</dd></div>' +
          '<div><dt>Pabaiga</dt><dd>' + formatDate(item.end) + '</dd></div>' +
        '</dl>' +
        '<div class="card-footer">' +
          '<span class="days-indicator">' + escapeHtml(daysText) + '</span>' +
          '<a class="secondary-cta" href="kvietimas.html?id=' + encodeURIComponent(item.id) + '">Peržiūrėti</a>' +
        '</div>' +
      '</article>';
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      state.activeFilter = button.dataset.filter;

      filterButtons.forEach(function (btn) {
        btn.classList.remove('is-active');
      });

      button.classList.add('is-active');
      render();
    });
  });

  loadInvitations();
})();
