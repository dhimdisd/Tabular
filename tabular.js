var arrayTabs = new Array();
// chrome.tabs.onActivated.addListener(function(info){
// 	chrome.tabs.get(info.tabId, function(tab){
// 		arrayTabs.push(tab.title);
// 	});	
// });
// chrome.browserAction.setPopup("background.html");

function init(){
	var body = document.getElementById('display');
	body.innerHTML += "<p>Hello World</p>";
	chrome.tabs.query({ 'currentWindow': true }, function(tabArray){
		
	});
	var views = chrome.extension.getViews();
	console.log(views);
	// console.log(chrome.extension.getBackgroundPage());

}


function sendRequest(){
	chrome.extension.sendRequest({ req: arrayTabs} , function(response){
		console.log(response);
	});
}
document.addEventListener('DOMContentLoaded', init);

