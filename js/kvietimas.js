(function () {
  'use strict';

  var DATA_URL = 'data/kvietimai.json';

  var titleEl = document.getElementById('invitationTitle');
  var leadEl = document.getElementById('invitationDescription');
  var descriptionEl = document.getElementById('descriptionText');
  var statusBannerEl = document.getElementById('statusBanner');
  var documentsEl = document.getElementById('documentsBlock');
  var metaCodeEl = document.getElementById('metaCode');
  var metaStartEl = document.getElementById('metaStart');
  var metaEndEl = document.getElementById('metaEnd');
  var metaStatusEl = document.getElementById('metaStatus');
  var ctaEl = document.getElementById('ctaButton');
  var notFoundEl = document.getElementById('notFoundState');
  var errorEl = document.getElementById('errorState');

  function getIdFromUrl() {
    return new URLSearchParams(window.location.search).get('id');
  }

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
        var invitations = Array.isArray(data) ? data : (data.kvietimai || []);
        var id = getIdFromUrl();

        var item = invitations.find(function (entry) {
          return entry.id === id;
        });

        if (!id || !item) {
          showNotFound();
          return;
        }

        renderInvitation(item);
      })
      .catch(function (error) {
        console.error('Nepavyko įkelti kvietimo:', error);
        errorEl.hidden = false;
      });
  }

  function showNotFound() {
    document.querySelector('.detail-card').hidden = true;
    document.querySelector('.side-card').hidden = true;
    notFoundEl.hidden = false;
    titleEl.textContent = 'Kvietimas nerastas';
    leadEl.textContent = 'Nurodytas kvietimo kodas neatitinka duomenų šaltinio.';
  }

  function renderInvitation(item) {
    var status = window.getInvitationStatus(item.start, item.end);

    document.title = item.pavadinimas + ' | APVIS kvietimas';
    titleEl.textContent = item.pavadinimas;
    leadEl.textContent = item.aprašymas;
    descriptionEl.textContent = item.aprašymas;

    statusBannerEl.className = 'status-banner ' + status.cssClass;
    statusBannerEl.innerHTML = '' +
      '<div>' +
        '<span class="status-pill ' + status.cssClass + '">' + escapeHtml(status.label) + '</span>' +
        (status.isLastDay ? '<span class="last-day-badge">PASKUTINĖ DIENA</span>' : '') +
      '</div>' +
      '<p>' + escapeHtml(status.message) + '</p>';

    metaCodeEl.textContent = item.id;
    metaStartEl.textContent = formatDate(item.start);
    metaEndEl.textContent = formatDate(item.end);
    metaStatusEl.textContent = status.label;

    ctaEl.textContent = status.ctaLabel;
    ctaEl.setAttribute('aria-disabled', String(!status.ctaEnabled));
    ctaEl.classList.toggle('is-disabled', !status.ctaEnabled);
    ctaEl.href = status.ctaEnabled ? '#paraiskos-teikimas' : '#';

    renderDocuments(item.dokumentai || []);
  }

  function renderDocuments(documents) {
    if (!documents.length) {
      documentsEl.innerHTML = '<p class="muted">Dokumentai šiam kvietimui dar nepaskelbti.</p>';
      return;
    }

    documentsEl.innerHTML = documents.map(function (doc) {
      return '' +
        '<a class="document-link" href="' + escapeHtml(doc.url) + '" target="_blank" rel="noopener">' +
          '<span>' + escapeHtml(doc.pavadinimas) + '</span>' +
          '<small>' + escapeHtml(doc.tipas || 'Dokumentas') + '</small>' +
        '</a>';
    }).join('');
  }

  loadInvitations();
})();
