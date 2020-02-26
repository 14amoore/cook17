/* globals chrome Tone */
/* eslint no-console: 0 */
// need to calculate time seperately from tone time.
// let timerStop;
// add mid level tones tied to a meaningful cookie parameter

let timer;

const startBtn = document.querySelector('#start');
const stopBtn = document.querySelector('#stop');

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

const noiseSynth = new Tone.NoiseSynth({
  noise: {
    type: 'pink'
  }
});

const vol = new Tone.Volume(-10);

noiseSynth.chain(vol, Tone.Master);

const osc = new Tone.OmniOscillator();

osc.toMaster();

const metal = new Tone.MetalSynth({
  envelope: {
    attack: 0.001,
    decay: 3,
    release: 1
  },
  octaves: 2.5
}).toMaster();

function onAllCookies(cookies) {
  console.log('all cookies', cookies.length, cookies);

  const secureCookies = cookies.filter(c => c.secure);

  const longlivedCookies = cookies.filter(c => c.expirationDate > 1615792811);
  const shortLivedCookies = cookies.filter(c => c.expirationDate < 1615792811);

  let sparkleTime = new Tone.Time('+0');
  let sparkleTimeKeeper = 0;

  console.log(shortLivedCookies, longlivedCookies);

  metal.frequency.value = cookies.length * 20;
  metal.modulationIndex.value =
    shortLivedCookies.length - longlivedCookies.length;
  metal.triggerAttackRelease();

  const allCookies = cookies.length;

  let bassTime = new Tone.Time('+0');
  let bassTimeKeeper = 0;
  cookies.forEach(c => {
    console.log(c.domain, c.secure);
    bassSynth.triggerAttackRelease(c.secure + c.domain.length, 0.125, bassTime);
    bassTime += 0.125;
    bassTimeKeeper += 125;
  });

  const bassRest = bassTimeKeeper * 1.5;

  osc.frequency.value = 60;
  console.log(allCookies);
  osc.start().stop(allCookies);

  console.log('secure cookies', secureCookies.length, secureCookies);

  timer = setTimeout(requestAllCookies, bassRest);
  function timerStop() {
    clearInterval(timer);
    console.log('stopping');
  }
  stopBtn.addEventListener('click', timerStop);
}

function requestAllCookies() {
  console.log('request all cookies');
  chrome.cookies.getAll({}, onAllCookies);
}

startBtn.addEventListener('click', requestAllCookies);
