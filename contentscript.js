window.addEventListener('keydown', shortcutWindow);
//shortcut key for popup
function shortcutWindow(e) {
    if ((e.metaKey && e.shiftKey && (e.keyCode == 75)) || (e.keyCode == 113)) { // cmd + shift + k or F2
        chrome.extension.sendMessage("openKeyPressed", function(res) {});
    }
}