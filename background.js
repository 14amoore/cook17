/* globals chrome */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: 'index.html' });
});

let y;

// function youAreHere() {
chrome.tabs.onActivated.addListener(function activeInfo() {
  chrome.tabs.get(activeInfo.tabId, function tab() {
    y = tab.url;
    console.log(`you are here: ${y}`);
  });
});
// }
// youAreHere();

chrome.omnibox.onInputEntered.addListener(text => {
  const newURL = `https://www.${encodeURIComponent(text)}`;
  chrome.tabs.create({ url: newURL });
});
