!function(n){function t(n){return function(){return!n.apply(null,arguments)}}function e(t){for(var e=0;e<n.tabs.length;e++)if(n.tabs[e]&&t===n.tabs[e].id)return e;return-1}var o=function(n){return!n||/^chrome-(devtools|extension)/.test(n.url)};n.removeTab=function(t){for(var e=0;e<n.tabs.length;e++)if(t===n.tabs[e].id){n.tabs.splice(e,1);break}},n.notInternalTab=t(o),n.getTabs=function(t){chrome.tabs.query({},function(e){n.tabs=e.filter(notInternalTab).sort(function(n,t){return t.index-n.index}),t&&t(n.tabs)})},n.getFilteredTabs=function(){return n.tabs.filter(n.notInternalTab)},n.removeUnkownTabs=function(){chrome.tabs.query({},function(t){var e=[];n.tabs.forEach(function(n,o){function r(n,t){var e;for(e=0;e<t.length;e++)if(t[e].id===n.id)return!0;return!1}(!n||"New Tab"===n.title&&!r(n,t))&&e.push(o)}),e.forEach(function(t){t>=0&&n.tabs.splice(t,1)}),e.length>0&&chrome.runtime.sendMessage({event:"Update",tabs:n.tabs,highlightedId:n.tabs[1]?n.tabs[1].id:n.tabs[0].id})})},n.getTabs(),chrome.tabs.onCreated.addListener(function(t){o(t)||n.tabs.unshift(t)}),chrome.tabs.onRemoved.addListener(function(t){var o=e(t);o>=0&&n.tabs.splice(o,1),chrome.runtime.sendMessage({event:"tabRemoved",tabId:t})}),chrome.tabs.onUpdated.addListener(function(t,r,i){var a=e(t);a>=0?n.tabs[a]=i:o(i)||n.tabs.push(i),chrome.runtime.sendMessage({event:"tabUpdated",tab:i})}),chrome.tabs.onActivated.addListener(function(t){var r=e(t.tabId);if(r>=0){var i=n.tabs[r];tabs.splice(r,1),tabs.unshift(i)}else chrome.tabs.get(t.tabId,function(t){t&&!o(t)&&n.tabs.unshift(t)})}),chrome.windows.onFocusChanged.addListener(function(t){t!==n.popupWindowId&&"number"==typeof n.popupWindowId&&chrome.windows.remove(n.popupWindowId,function(){chrome.runtime.lastError||(n.popupWindowId=null)})}),chrome.windows.onRemoved.addListener(function(t){t===n.popupWindowId&&"number"==typeof n.popupWindowId&&(n.popupWindowId=null)}),chrome.commands.onCommand.addListener(function(t){var e=450,o=new RegExp("win","i");o.test(navigator.platform)&&(e=480),"showTabularPopup"===t&&(null==n.popupWindowId?chrome.windows.create({url:"build/popup.html",type:"popup",focused:!0,width:e,height:600,left:screen.width/2-e/2,top:screen.height/2-300},function(t){n.popupWindowId=t.id}):chrome.windows.remove(n.popupWindowId,function(){n.popupWindowId=null}))})}(window);