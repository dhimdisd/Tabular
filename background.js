//initializing the list when the extension loads up
(function() {
	setUpList();
})();

//chrome extensions command
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab){
		switchTabToFront(tab);
	});
});

chrome.tabs.onCreated.addListener(function (tab){
	// (tab.title == "")? true : addToList(tab);
	addToList(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	// (tab.title == "tabular" || tab.status =="loading")? true : changeTabInfo(tab);
	changeTabInfo(tab);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	var element = "#" + tabId;
	$(element).remove();
});

chrome.windows.onFocusChanged.addListener(function(windowId){
	if (windowId != -1){
		chrome.tabs.query({
			'windowId': windowId, 
			'active' : true}, function (tabArray){
				switchTabToFront(tabArray[0]);
			});
	}
});


//-------------------------------------------------------------------------

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request ==  "openKeyPressed"){
		keyOpenWindow();		
	}
	else{
		sendResponse({});
	}
});


//---------------------------------------------------------------


// document.addEventListener('keydown', keyOpenWindow, false);
function keyOpenWindow (){
	chrome.windows.create({ 
			'url': 'popup.html', 
			'type': 'popup',
			'focused' : true,
			'width': 430,
			'top': 100,
			'left': 400,
			'height': 600
			// 'tabular': true
		}, 
		function (createdWindow){
			
		}
	);
}


//-----------------------------------------------
function setUpList (){
	chrome.tabs.query({}, function(tabArray){
		for(var tab in tabArray){
			addToList(tabArray[tab]);
		}
	});
}

function addToList(tab){
	//add li element
	var tabElement = '<li id="' +tab.id +'" >'
	tabElement += addFavIconElement(tab);
	tabElement += addTitle(tab);
	// var regExpUrl = /chrome*/;
	// //add image tag
	// if(tab.favIconUrl && (tab.favIconUrl.length > 0) && !regExpUrl.test(tab.favIconUrl)){
	// 	tabElement += '<img src="'+ tab.favIconUrl + '"/>'
	// }
	// //add title element
	// tabElement += '<div class="title">' + tab.title + '</div></li>';
	$('#tabsList').prepend(tabElement);
	addEventToTab(tab);
	// var list = document.getElementById('tabsList');
	// list.innerHTML+= '<li id="' +tab.id +'" >' + tab.title + '</li>';	
}

function changeTabInfo(tab){
	var tabDetail = addFavIconElement(tab);
	tabDetail += addTitle(tab);
	$tabElement = $('#' + tab.id);
	$tabElement.empty();
	$tabElement.prepend(tabDetail);
	// var element = document.getElementById(tab.id);
	// element.innerHTML = tab.title;
}
function switchTabToFront(tab){
	var element = "#" + tab.id;
	$('#tabsList').prepend($(element).detach());
}

function addEventToTab(tab){
	var element = "#" + tab.id;
	$(element).on('hover', function(){
		$(this).siblings().removeClass('highlighted');
		$(this).addClass('highlighted');
	});
	$(element).on("click", function(){
		chrome.tabs.update(tab.id, {'active': true}, function(activeTab){});
	});
}
//-------------------------------------------
function addFavIconElement(tab){
	var tabElement;
	if(tab.favIconUrl && (tab.favIconUrl.length > 0) && !/chrome*/.test(tab.favIconUrl)){
		tabElement = '<img alt="" src="'+ tab.favIconUrl + '"/>'
		return tabElement;
	}
	else
		return '';
}

function addTitle(tab){
	return '<div class="title">' + tab.title + '</div>';
}
//-----------------------------------------------------

function getTabs(){
	return $('li').clone(true);
}

// function consoleThis(obj){
// 	console.log(obj);
// }