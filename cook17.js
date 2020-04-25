/* globals chrome Tone */
/* eslint no-console: 0 */
// need to calculate time seperately from tone time.
// let timerStop;
// add mid level tones tied to a meaningful cookie parameter

let timer;

const startBtn = document.querySelector('#start');
const stopBtn = document.querySelector('#stop');
const clearBtn = document.querySelector('#clear');

chrome.omnibox.onInputEntered.addListener(function getDomain(text) {
  console.log(text);
});

const trashSample = new Tone.Player('trashEdit.wav').toMaster();

const bassSynth = new Tone.MembraneSynth({
  envelope: {
    sustain: 1,
    release: 1,
    releaseCurve: 'ripple'
  }
});

const panVol = new Tone.PanVol();
const panVol2 = new Tone.PanVol();

const midSynth = new Tone.MembraneSynth();
midSynth.connect(panVol);
const midSynth2 = new Tone.MembraneSynth();
midSynth2.connect(panVol2);

// const oscVol = new Tone.Volume(-5).toMaster();
const osc = new Tone.OmniOscillator();
// osc.connect(oscVol);
osc.toMaster();

const metal = new Tone.MetalSynth({
  envelope: {
    attack: 0.001,
    decay: 3,
    release: 1
  },
  octaves: 2.5
});

function oscStop() {
  osc.stop();
}

function allStop() {
  bassSynth.disconnect();
  panVol.disconnect();
  panVol2.disconnect();
  metal.disconnect();
}

function allConnect() {
  bassSynth.toMaster();
  panVol.toMaster();
  panVol2.toMaster();
  metal.toMaster();
}

startBtn.addEventListener('click', allConnect);

function onAllCookies(cookies) {
  // console.log('all cookies', cookies.length, cookies);
  const allCookies = cookies.length;
  const allCookieString = allCookies.toString();

  osc.frequency.value = 60;
  // console.log(allCookieString);

  const secureCookies = cookies.filter(c => c.secure);

  const date = Date.now();
  const weekOut = date + 604800000;

  const longlivedCookies = cookies.filter(c => c.expirationDate > weekOut);
  const shortLivedCookies = cookies.filter(c => c.expirationDate < weekOut);

  // console.log(shortLivedCookies, longlivedCookies);

  metal.frequency.value = cookies.length * 20;
  metal.modulationIndex.value =
    shortLivedCookies.length - longlivedCookies.length;
  metal.triggerAttackRelease();

  let midTime = new Tone.Time('+0');
  let midTimeKeeper = 0;
  cookies.forEach(c => {
    if (c.session) {
      panVol.pan.value = 1;
      midSynth.triggerAttackRelease(
        cookies.length + c.domain.length,
        0.25,
        midTime
      );
      // console.log('pan right');
      midTime += 0.25;
      midTimeKeeper += 500;
    }
  });

  let otherTime = new Tone.Time('+0.125');
  let otherTimeKeeper = 0;
  cookies.forEach(c => {
    panVol2.pan.value = -1;
    panVol2.volume.value = -10;
    // console.log(c.hostOnly);
    midSynth2.triggerAttackRelease(
      cookies.length + c.domain.length,
      0.125,
      otherTime
    );
    // console.log('pan left');
    otherTime += 0.125;
    otherTimeKeeper += 500;
  });

  let bassTime = new Tone.Time('+0');
  let bassTimeKeeper = 0;
  cookies.forEach(c => {
    // console.log(c.domain, c.secure);
    bassSynth.triggerAttackRelease(c.secure + c.domain.length, 0.125, bassTime);
    bassTime += 0.125;
    bassTimeKeeper += 188;
  });

  let bassRest;

  if (bassTimeKeeper <= 0) {
    bassRest = 1000;
  } else {
    bassRest = bassTimeKeeper;
  }

  // console.log('secure cookies', secureCookies.length, secureCookies);

  timer = setTimeout(requestAllCookies, bassRest);
  function timerStop() {
    clearTimeout(timer);
    console.log('stopping');
    startBtn.disabled = false;
    location.reload();
  }
  stopBtn.addEventListener('click', timerStop);
  stopBtn.addEventListener('click', oscStop);
  stopBtn.addEventListener('click', allStop);
  osc.start('+0').stop(`+${allCookieString}`);
}

function requestAllCookies() {
  this.disabled = true;
  stopBtn.disabled = false;
  console.log('request all cookies');
  chrome.cookies.getAll({}, onAllCookies);
}

startBtn.addEventListener('click', requestAllCookies);

function CookieCache() {
  this.cookies_ = {};

  this.reset = function() {
    this.cookies_ = {};
  };

  this.add = function(cookie) {
    let domain = cookie.domain;
    if (!this.cookies_[domain]) {
      this.cookies_[domain] = [];
    }
    this.cookies_[domain].push(cookie);
  };

  this.remove = function(cookie) {
    let domain = cookie.domain;
    if (this.cookies_[domain]) {
      let i = 0;
      while (i < this.cookies_[domain].length) {
        if (cookieMatch(this.cookies_[domain][i], cookie)) {
          this.cookies_[domain].splice(i, 1);
        } else {
          i += 1;
        }
      }
      if (this.cookies_[domain].length == 0) {
        delete this.cookies_[domain];
      }
    }
  };
}

this.getDomains = function(filter) {
  const result = [];
  sortedKeys(this.cookies_).forEach(function(domain) {
    if (!filter || domain.indexOf(filter) != -1) {
      result.push(domain);
    }
  });
  return result;
};

function removeCookie(cookie) {
  let url =
    'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
  chrome.cookies.remove({ url: url, name: cookie.name });
}

const cache = new CookieCache();

function removeAll() {
  chrome.cookies.getAll({}, function(cookies) {
    for (let i in cookies) {
      cache.add(cookies[i]);
      removeCookie(cookies[i]);
    }
  });
  chrome.cookies.getAll({}, cookies => {
    document.querySelector(
      '#cookiesCleared'
    ).textContent = `All cookies have been deleted.`;
    document.querySelector('#cookiesCleared').style.visibility = 'visible';
    setTimeout(function() {
      document.querySelector('#cookiesCleared').style.visibility = 'hidden';
    }, 2500);
    trashSample.start();
  });
}

clearBtn.addEventListener('click', removeAll);

function newSite() {
  const rawAddress = document.querySelector('#nav').value;
  // console.log(rawAddress);
  const address = `https://www.${rawAddress}`;
  const tab = window.open(address, '_blank');
  tab.focus();
}

document.querySelector('#submit').addEventListener('click', newSite);

function clearAddress() {
  document.querySelector('#nav').value = '';
}

function logKey(e) {
  if (e.code === 'Enter') {
    newSite();
    clearAddress();
  }
}

document.querySelector('#nav').addEventListener('keydown', logKey);
