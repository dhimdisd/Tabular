window.addEventListener('keydown',shortcutWindow );
function shortcutWindow(e){
	if (e.metaKey && e.shiftKey && (e.keyCode == 75) ){
			chrome.extension.sendRequest("openKeyPressed", function (response){
		});
	}
}
