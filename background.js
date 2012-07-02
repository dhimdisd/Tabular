//initializing the list when the extension loads up
(function() {
	setUpList();
})();

//chrome extensions command
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab){
		switchTabToFront(tab);
	})
});

chrome.tabs.onCreated.addListener(function (tab){
	addToList(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	// if (changeInfo.hasOwnProperty('url')){
		// console.log(tab);
		changeTabInfo(tab);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	var element = "#" + tabId;
	$(element).remove();
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	sendResponse(changeList());
});

chrome.windows.onFocusChanged.addListener(function(windowId){
	if (windowId != -1){
		chrome.tabs.query({
			'windowId': windowId, 
			'active' : true}, function (tabArray){
				console.log(tabArray[0].id);
				switchTabToFront(tabArray[0]);
			})
		// chrome.tabs.getSelected(windowId, function(tab){
			
		// });
	}
});
//-------------------------------------------------------------------------

// chrome.windows.create({ 
// 	'url': '' 
// 	'type': 'panel',
// 	'focused' : true,
// 	'width': 300,
// 	'height': 500
// 	}, 
// 	function (window){
// 		console.log(window);
// 	}
// );
// var notification = webkitNotifications.createHTMLNotification( 'notification.html');
// notification.show();

//-----------------------------------------------
function setUpList (){
	chrome.tabs.query({}, function(tabArray){
		for(var tab in tabArray){
			addToList(tabArray[tab]);
		}
	});
}

function addToList(tab){
	var tabElement = '<li id="' +tab.id +'" >' + tab.title + '</li>';
	$('#tabsList').prepend(tabElement);
	// var list = document.getElementById('tabsList');
	// list.innerHTML+= '<li id="' +tab.id +'" >' + tab.title + '</li>';	
}

function changeTabInfo(tab){
	var element = "#" + tab.id;
	var replacingTag = '<li id="' +tab.id +'" >' + tab.title + '</li>'
	$(element).replaceWith(replacingTag);
}
function switchTabToFront(tab){
	var element = "#" + tab.id;
	$('#tabsList').prepend($(element).detach());
}

function itemsIntoTabArray(){
	var tabArray = [];
	var li = $('li')
	li.each(function(){
		var tab = { 
			'id': $(this).attr('id'),
			'title': $(this).text()
		};
		tabArray.push(tab);
		// tabArray.push($(this).text());
	});
	return tabArray;
}

function changeList(){
	var tabArray = [];
	$('li').each(function(){
		tabArray.push($(this).text());
	});

	array = $.makeArray();;
	return array;
}

function addEventToTab(){
	
}
function getTabs(){
	return $('li').clone();
}
