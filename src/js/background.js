(function(w) {
  var isInternalTab = function(tab) {
    return !tab || /^chrome-(devtools|extension)/.test(tab.url);
  }
  // var isNotPopURL = function (tab){
  //   return /build/popup.html/
  // }

  function complement(f) {
    return function() {
      return !f.apply(null, arguments);
    };
  }

  w.removeTab = function (tabId){
    for (var i = 0; i < w.tabs.length; i++) {
      if (tabId === w.tabs[i].id) {
        w.tabs.splice(i, 1);
        break;
      }
    }
  }

  w.notInternalTab = complement(isInternalTab);

  w.getTabs = function(cb) {
    chrome.tabs.query({}, function(tabs) {
      w.tabs =
        tabs
          // .filter(notInternalTab)
          .sort(function(a, b) {
            return b.index - a.index;
          });
      if (cb) {
        cb(w.tabs);
      }
    });
  };

  w.getTabs();

  function indexOfTab(tabId) {
    for(var i = 0; i < w.tabs.length; i++) {
      if(w.tabs[i] && tabId === w.tabs[i].id) {
        return i;
      }
    }
    return -1;
  }

  chrome.tabs.onCreated.addListener(function(tab) {
      w.tabs.unshift(tab);
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      var index = indexOfTab(tabId);
      if (index >= 0){
        w.tabs.splice(index, 1);
      } 
      // chrome.runtime.sendMessage({ event: 'tabRemoved', tabId: tabId });
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var index = indexOfTab(tabId);
    if (index >= 0){
      w.tabs[index] = tab;
    } else {
      w.tabs.push(tab);
    }
    // chrome.runtime.sendMessage({ event: 'tabUpdated', tab: tab });
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    var index = indexOfTab(activeInfo.tabId);
    if (index >= 0){
      var tab = w.tabs[index];
      tabs.splice(index,1);
      tabs.unshift(tab);
    } else {
      w.tabs.unshift(tab);
    }
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId !== w.popupWindowId && typeof w.popupWindowId === 'number') {
      chrome.windows.remove(w.popupWindowId, function() {
        w.popupWindowId = null;
      });
    }
  });

  //Listens for Key to popup app
  chrome.commands.onCommand.addListener(function(command) {
    var width = 450;
    var platformRgx = new RegExp('win', 'i');
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
        chrome.windows.remove(w.popupWindowId, function() {
          w.popupWindowId = null;
        });
      }
    }
  });
})(window);
