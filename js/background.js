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
      chrome.runtime.sendMessage({ event: 'tabCreated' }, function(res) {});
    }
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    w.tabs = w.tabs.filter(function(tab, idx, arr) {
      return tabId !== tab.id;
    });

    chrome.runtime.sendMessage({
      event: 'tabRemoved',
      tabId: tabId
    }, function(res) {});
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    for (var i = 0; i < w.tabs.length; i++) {
      if (tab.index === w.tabs[i].index && notInternalTab(tab)) { // why index i have no clue
        w.tabs[i] = tab;
        break;
      }
    }

    chrome.runtime.sendMessage({
      event: 'tabUpdated',
      tab: tab
    }, function(res) {});
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      for (var i = 0; i < w.tabs.length; i++) {
        if (tab.id === w.tabs[i].id) {
          w.tabs.splice(i, 1)[0];
          w.tabs.unshift(tab);

          chrome.runtime.sendMessage({
            event: 'tabActivated',
            tabId: tab.id
          });

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
    if (command === 'showTabularPopup') {
      if (w.popupWindowId == null) {
        chrome.windows.create({
          url: 'popup.html',
          type: 'popup',
          focused: true,
          width: 450,
          height: 600,
          left: (screen.width / 2) - 225,
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
