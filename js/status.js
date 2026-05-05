/*
  Vienintelė kvietimų būsenų logikos vieta.
  Visi puslapiai turi naudoti getInvitationStatus(startDate, endDate, now?).
*/
(function (global) {
  'use strict';

  function parseDate(value) {
    if (!value) return null;
    var date = new Date(value + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function diffDays(from, to) {
    var msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((startOfDay(to) - startOfDay(from)) / msPerDay);
  }

  function getInvitationStatus(startDate, endDate, now) {
    var today = startOfDay(now ? new Date(now) : new Date());
    var start = parseDate(startDate);
    var end = parseDate(endDate);

    if (!start || !end) {
      return {
        key: 'unknown',
        label: 'Nežinoma',
        cssClass: 'status-unknown',
        daysLeft: null,
        isLastDay: false,
        ctaLabel: 'Informacija ruošiama',
        ctaEnabled: false,
        message: 'Kvietimo datos nenurodytos arba neteisingos.'
      };
    }

    if (today < startOfDay(start)) {
      var daysUntilStart = diffDays(today, start);

      return {
        key: 'planned',
        label: 'Planuojamas',
        cssClass: 'status-planned',
        daysLeft: null,
        daysUntilStart: daysUntilStart,
        isLastDay: false,
        ctaLabel: 'Kvietimas dar neprasidėjo',
        ctaEnabled: false,
        message: 'Kvietimas prasidės po ' + daysUntilStart + ' d.'
      };
    }

    if (today > startOfDay(end)) {
      return {
        key: 'closed',
        label: 'Užbaigtas',
        cssClass: 'status-closed',
        daysLeft: 0,
        isLastDay: false,
        ctaLabel: 'Kvietimas užbaigtas',
        ctaEnabled: false,
        message: 'Paraiškų teikimo laikotarpis pasibaigė.'
      };
    }

    var daysLeft = diffDays(today, end);

    return {
      key: 'open',
      label: 'Atviras',
      cssClass: 'status-open',
      daysLeft: daysLeft,
      isLastDay: daysLeft === 0,
      ctaLabel: daysLeft === 0 ? 'Teikti paraišką šiandien' : 'Teikti paraišką',
      ctaEnabled: true,
      message: daysLeft === 0
        ? 'Paskutinė paraiškų teikimo diena.'
        : 'Iki pabaigos liko ' + daysLeft + ' d.'
    };
  }

  global.getInvitationStatus = getInvitationStatus;
})(window);
