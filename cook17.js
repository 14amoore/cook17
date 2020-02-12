/* globals chrome Tone */
/* eslint no-console: 0 */

chrome.omnibox.onInputEntered.addListener(function getDomain(text) {
  console.log(text);
});

const bassSynth = new Tone.MembraneSynth({
  envelope: {
    sustain: 1,
    release: 1,
    releaseCurve: 'ripple'
  }
});

const panVol = new Tone.PanVol().toMaster();

bassSynth.connect(panVol);

function onAllCookies(cookies) {
  console.log('all cookies', cookies.length, cookies);

  const secureCookies = cookies.filter(c => c.secure);

  const longlivedCookies = cookies.filter(c => c.expirationDate > 1000);

  const sessionCookies = cookies.filter(c => c.session);

  //   let time = new Tone.Time('+0');
  //   cookies.forEach(c => {
  //     console.log(c.domain, c.secure);
  //     bassSynth.triggerAttackRelease(30 + c.domain.length, '4n', time);
  //     time += 0.125;
  //   });

  //   console.log(time);
  //   setTimeout(requestAllCookies, 5050);

  console.log('secure cookies', secureCookies.length, secureCookies);
  console.log('session cookies', sessionCookies.length, sessionCookies);
}

function requestAllCookies() {
  console.log('request all cookies');
  chrome.cookies.getAll({}, onAllCookies);
}

const startBtn = document.querySelector('#start');

startBtn.addEventListener('click', requestAllCookies);
