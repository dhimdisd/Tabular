(function() {
  window.addEventListener('keydown', function(e) {
    // cmd + shift + k or F2
    if ((e.metaKey && e.shiftKey && (e.keyCode === 75)) || (e.keyCode === 113)) {
      chrome.extension.sendMessage('openKeyPressed', function(res) {});
    }
  });
})();
