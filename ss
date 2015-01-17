diff --git a/src/js/background.js b/src/js/background.js
index 5a72fd9..abef10c 100644
--- a/src/js/background.js
+++ b/src/js/background.js
@@ -37,6 +37,10 @@
     });
   };
 
+  w.getFilteredTabs = function(){
+    return w.tabs.filter(w.notInternalTab);
+  };
+
   w.getTabs();
 
   function indexOfTab(tabId) {
@@ -49,6 +53,7 @@
   }
 
   chrome.tabs.onCreated.addListener(function(tab) {
+    //We should probably check if tab exist in the list
       w.tabs.unshift(tab);
   });
 
@@ -90,7 +95,7 @@
         w.popupWindowId = null;
       });
     }
-  });
+  }); 
 
   //Listens for Key to popup app
   chrome.commands.onCommand.addListener(function(command) {
