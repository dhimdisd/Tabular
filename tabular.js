function highlighted()

function init(){
	var bg = chrome.extension.getBackgroundPage();
	$('#tabsList').append(bg.getTabs());
}

//Get it started
document.addEventListener('DOMContentLoaded', init);

