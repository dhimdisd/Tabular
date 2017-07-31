(function(w) {
  var isInternalTab = function(tab) {
    return !tab || /^chrome-(devtools|extension)/.test(tab.url);
  };
  // var isNotPopURL = function (tab){
  //   return /build/popup.html/
  // }

  function complement(f) {
    return function() {
      return !f.apply(null, arguments);
    };
  }

  w.removeTab = function (tabId){
    var i = w.tabs.length;
    while(i--) 
    {
      if (tabId === w.tabs[i].id) {
        w.tabs.splice(i, 1);
      }
    }
  };

  w.notInternalTab = complement(isInternalTab);

  w.getTabs = function(cb) {
    chrome.tabs.query({}, function(tabs) {
      w.tabs =
        tabs
           .filter(notInternalTab)
          .sort(function(a, b) {
            return b.index - a.index;
          });
      if (cb) {
        cb(w.tabs);
      }
    });
  };

  w.getFilteredTabs = function(){
    return w.tabs.filter(w.notInternalTab);
  };

  //hack since there are new tabs being created that don't exist
  w.removeUnkownTabs = function (){
     chrome.tabs.query({}, function(tabs) {
      var newTabs = [];
      w.tabs.forEach(function (tab, index, internalTabs){
        function containsTab(tab, tabs) {
 
            var i;
            for (i = 0; i < tabs.length; i++) {
                if (tabs[i].id === tab.id) {
                    return true;
                }
            }
            return false;
        }
 
        if (!tab || (tab.title === 'New Tab' && !containsTab(tab, tabs))) {
          
        }else{
          newTabs.push(tab);
        }
      });
 
      w.tabs = newTabs;
 
      if (newTabs.length > 0){
        chrome.runtime.sendMessage({ event: 'Update', tabs: w.tabs,
          highlightedId : w.tabs[1]? w.tabs[1].id : w.tabs[0].id });
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
      if(!isInternalTab(tab))
        w.tabs.unshift(tab);
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      var index = indexOfTab(tabId);
      if (index >= 0){
        w.tabs.splice(index, 1);
      }
      chrome.runtime.sendMessage({ event: 'tabRemoved', tabId: tabId });
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var index = indexOfTab(tabId);
    if (index >= 0){
      w.tabs[index] = tab;
    } else {
      if (!isInternalTab(tab))
        w.tabs.push(tab);
    }
    chrome.runtime.sendMessage({ event: 'tabUpdated', tab: tab });
  });

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    var index = indexOfTab(activeInfo.tabId);
    if (index >= 0){
      var tab = w.tabs[index];
      tabs.splice(index,1);
      tabs.unshift(tab);
    } else {
      chrome.tabs.get(activeInfo.tabId, function(tab) {
        if(tab && !isInternalTab(tab))
          w.tabs.unshift(tab);
      });
    }
  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId !== w.popupWindowId && typeof w.popupWindowId === 'number') {

      chrome.windows.remove(w.popupWindowId, function() {
        if (!chrome.runtime.lastError)
          w.popupWindowId = null;
      });
    }
    if (windowId != chrome.windows.WINDOW_ID_NONE) {
      chrome.tabs.query({windowId:windowId, active:true}, function (tabArray) {
         for(var j = 0; j < tabArray.length; j++) {
           var idx = indexOfTab(tabArray[j].id);
           if(idx >= 0) {
             var tab = w.tabs[idx];
             w.tabs.splice(idx, 1);
             w.tabs.unshift(tab);
           }
         }
      });
    }
  });

  chrome.windows.onRemoved.addListener(function(windowId){
    if (windowId === w.popupWindowId && typeof w.popupWindowId === 'number') {
        w.popupWindowId = null;
    }
  });

  //Listens for Key to popup app
  chrome.commands.onCommand.addListener(function(command) {
    var width = 450,
      height = 600,
      left = (screen.width/ 2) - (width/ 2),
      top = (screen.height/ 2) - (height/ 2);

      if(w.screenX) {
        left += w.screenX;
      }

    // var platformRgx = new RegExp('win', 'i');
    // if (platformRgx.test(navigator.platform)) {
    //   width = 480;
    // }
    if (command === 'showTabularPopup') {
      if (w.popupWindowId == null) {
        chrome.windows.create({
          url: 'build/popup.html',
          type: 'popup',
          focused: true,
          width: width,
          height: height,
          left: left,
          top:  top
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
