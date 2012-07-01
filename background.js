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
		console.log(tab);
		changeTabInfo(tab);
	// }
	// else {
	// 	// console.log(changeInfo);
	// }
	
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
				switchTabToFront(tabArray[0]);
			})
		// chrome.tabs.getSelected(windowId, function(tab){
			
		// });
	}
});
//-------------------------------------------------------------------------

function setUpList (){
	chrome.tabs.query({}, function(tabArray){
		for(var tab in tabArray){
			addToList(tabArray[tab]);
		}
	});
}

function putTabs(tabArray){
	$('#tabsList').html('');
	for(var tab in tabArray){
		addToList(tabArray[tab]);
	}
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

function putOnTop(tab, tabArray){
	var id= tab.id;
	for (var i = 0; i < tabArray.length; i++) {
		if  (tabArray[i].id == id ) {
			tabArray.splice(i,1);
			break;
		}
	}
	tabArray.splice(0,0 ,tab);

	return tabArray;
}
