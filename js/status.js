/**
 * status.js
 * ----------------------------------------------------
 * VIENINTELĖ kvietimų būsenų ir terminų logika.
 * Naudojama:
 *  - kvietimų sąraše (index.html)
 *  - vieno kvietimo puslapyje (kvietimas.html)
 *
 * Keiti čia → keičiasi visur.
 */

const MS_DAY = 1000 * 60 * 60 * 24;

/**
 * Nustato kvietimo būseną ir susijusią informaciją.
 *
 * @param {Date} startDate  – kvietimo pradžios data
 * @param {Date} endDate    – kvietimo pabaigos data
 * @param {Date} [now]      – dabartinė data (testams galima perduoti kitą)
 *
 * @returns {{
 *   status: 'open' | 'planned' | 'closed',
 *   label: string,
 *   info: string,
 *   variant?: 'last-day' | 'green'
 * }}
 */
function getInvitationStatus(startDate, endDate, now = new Date()) {

  // 🟡 Planuojamas (dar neprasidėjo)
  if (now < startDate) {
    const daysToStart = Math.ceil((startDate - now) / MS_DAY);

    return {
      status: 'planned',
      label: 'Planuojamas',
      info: `Prasidės po ${daysToStart} d.`
    };
  }

  // 🔴 Užbaigtas
  if (now > endDate) {
    return {
      status: 'closed',
      label: 'Užbaigtas',
      info: 'Kvietimas pasibaigęs'
    };
  }

  // 🟢 Atviras
  const daysLeft = Math.ceil((endDate - now) / MS_DAY);

  // 🔥 PASKUTINĖ DIENA
  if (daysLeft <= 1) {
    return {
      status: 'open',
      label: 'Atviras',
      info: 'PASKUTINĖ DIENA',
      variant: 'last-day'
    };
  }

  // ✅ Atviras (liko daugiau dienų)
  return {
    status: 'open',
    label: 'Atviras',
    info: `Liko ${daysLeft} d.`,
    variant: 'green'
  };
}

/* ----------------------------------------------------
 * Jei nenaudoji modulių (GitHub Pages default),
 * funkcija bus pasiekiama globaliai per `window`.
 * -------------------------------------------------- */
window.getInvitationStatus = getInvitationStatus;
