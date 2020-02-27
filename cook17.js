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
}).toMaster();

const panVol = new Tone.PanVol().toMaster();
const panVol2 = new Tone.PanVol().toMaster();

const midSynth = new Tone.MembraneSynth();
midSynth.connect(panVol);

const midSynth2 = new Tone.MembraneSynth();
midSynth2.connect(panVol2);

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

  const date = Date.now();
  const weekOut = date + 604800000;

  const longlivedCookies = cookies.filter(c => c.expirationDate > weekOut);
  const shortLivedCookies = cookies.filter(c => c.expirationDate < weekOut);

  console.log(shortLivedCookies, longlivedCookies);

  metal.frequency.value = cookies.length * 20;
  metal.modulationIndex.value =
    shortLivedCookies.length - longlivedCookies.length;
  metal.triggerAttackRelease();

  let midTime = new Tone.Time('+0');
  // let midTimeKeeper = 0;
  cookies.forEach(c => {
    if (c.session) {
      panVol.pan.value = 1;
      midSynth.triggerAttackRelease(
        cookies.length + c.domain.length,
        0.25,
        midTime
      );
      console.log('pan right');
      midTime += 0.25;
      // midTimeKeeper += 500;
    }
  });

  let otherTime = new Tone.Time('+0.125');
  // let otherTimeKeeper = 0;
  cookies.forEach(c => {
    panVol2.pan.value = -1;
    panVol2.volume.value = -10;
    console.log(c.hostOnly);
    midSynth2.triggerAttackRelease(
      cookies.length + c.domain.length,
      0.125,
      otherTime
    );
    console.log('pan left');
    otherTime += 0.125;
    // otherTimeKeeper += 500;
  });

  let bassTime = new Tone.Time('+0');
  let bassTimeKeeper = 0;
  cookies.forEach(c => {
    console.log(c.domain, c.secure);
    bassSynth.triggerAttackRelease(c.secure + c.domain.length, 0.125, bassTime);
    bassTime += 0.125;
    bassTimeKeeper += 125;
  });

  const bassRest = bassTimeKeeper * 1.5;

  const allCookies = cookies.length;

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
