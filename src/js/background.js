(function(w) {
  function isInternalTab(tab) {
    return /^chrome-(devtools|extension)/.test(tab.url);
  }

  function complement(f) {
    return function() {
      return !f.apply(null, arguments);
    };
  }

  var notInternalTab = complement(isInternalTab);

  chrome.tabs.query({}, function(tabs) {
    w.tabs =
      tabs
        .filter(notInternalTab)
        .sort(function(a, b) {
          return b.index - a.index;
        });
  });

  chrome.tabs.onCreated.addListener(function(tab) {
    if (notInternalTab(tab)) {
      w.tabs.unshift(tab);
    }
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    for (var i = 0; i < w.tabs.length; i++) {
      if (tabId === w.tabs[i].id) {
        w.tabs.splice(i, 1);
        break;
      }
    }
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    for (var i = 0; i < w.tabs.length; i++) {
      if (tab.index === w.tabs[i].index && notInternalTab(tab)) { // why index i have no clue
        w.tabs[i] = tab;
        break;
      }
    }

  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      for (var i = 0; i < w.tabs.length; i++) {
        if (tab.id === w.tabs[i].id) {
          w.tabs.splice(i, 1)[0];
          w.tabs.unshift(tab);
          break;
        }
      }
    });
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId !== w.popupWindowId && typeof w.popupWindowId === 'number') {
      chrome.windows.remove(w.popupWindowId, function() {
        w.popupWindowId = null;
      });
    }
  });

  chrome.commands.onCommand.addListener(function(command) {
    var width = 450;
    var platformRgx = new RegExp('win', 'i')
    if (platformRgx.test(navigator.platform)) {
      width = 480;
    }
    if (command === 'showTabularPopup') {
      if (w.popupWindowId == null) {
        chrome.windows.create({
          url: 'build/popup.html',
          type: 'popup',
          focused: true,
          width: width,
          height: 600,
          left: (screen.width / 2) - (width / 2),
          top: (screen.height / 2) - 300
        }, function(popupWindow) {
          w.popupWindowId = popupWindow.id;
        });
      } else {
        chrome.windows.remove(w.popupWindowId, function() {});
      }
    }
  });
})(window);
