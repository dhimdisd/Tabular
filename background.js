//--------------------initializing the list when the extension loads up-----

(function() {
	setUpList();
})();

//---------------------chrome tabs functions---------------------------------

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab) {
		if ($("#" + tab.id) != 0)
			switchTabToFront(tab);
	});
});

chrome.tabs.onCreated.addListener(function(tab) {
	// (tab.title == "")? true : addToList(tab);
	addToList(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// (tab.title == "tabular" || tab.status =="loading")? true : changeTabInfo(tab);
	changeTabInfo(tab);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	var element = "#" + tabId;
	$(element).remove();
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
	if (windowId != -1) {
		chrome.tabs.query({
			'windowId': windowId,
			'highlighted': true
		}, function(tabArray) {
			if ($("#" + tabArray[0].id) != 0)
				switchTabToFront(tabArray[0]);
		});
	}
});

//-------------------------------------------------------------------------

//gets message from content script
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request === "openKeyPressed") {
		chrome.runtime.sendMessage("PopUp", function(res) {
			if (res === undefined)
				keyOpenWindow();
			else {
				chrome.tabs.remove(res.id, function() {
					keyOpenWindow();
				});
			}
		});
	} else {
		sendResponse({});
	}
});

//---------------------------------------------------------------
// When the content script is activated it calls this function
//it is called in the function above

function keyOpenWindow() {

	chrome.windows.create({
		'url': 'popup.html',
		'type': 'popup',
		'focused': true,
		'width': 430,
		'top': 100,
		'left': 400,
		'height': 600
		// 'tabular': true
	});
}

//-----------------------------------------------

function setUpList() {
	chrome.tabs.query({}, function(tabArray) {
		for (var tab in tabArray) {
			addToList(tabArray[tab]);
		}
	});
}

//------------functions to manipulate tabs----------- 

function addToList(tab) {
	var tabElement = '<li id="' + tab.id + '" >'
	tabElement += addFavIconElement(tab); //adds the icon of the tab
	tabElement += addTitle(tab) + '</li>'; //adds the title
	$('#tabsList').prepend(tabElement);
	addEventToTab(tab);

	//Add events to tab
	function addEventToTab(tab) {
		var element = "#" + tab.id;
		$(element).on('hover', function() {
			$(this).siblings().removeClass('highlighted');
			$(this).addClass('highlighted');
		});
		$(element).on("click", function() {
			chrome.tabs.update(tab.id, {
				'active': true,
				'highlighted': true
			});
			chrome.windows.update(tab.windowId, {
				'focused': true
			});

		});
	}
}

function changeTabInfo(tab) {
	var tabDetail = addFavIconElement(tab);
	tabDetail += addTitle(tab);
	$tabElement = $('#' + tab.id);
	$tabElement.empty();
	$tabElement.prepend(tabDetail);
}

function switchTabToFront(tab) {
	var element = "#" + tab.id;
	$('#tabsList').prepend($(element).detach());
}



//-------------------------------------------

function addFavIconElement(tab) {
	var tabElement;
	if (tab.favIconUrl && (tab.favIconUrl.length > 0) && !/chrome.*/.test(tab.favIconUrl)) {
		tabElement = '<img alt="" src="' + tab.favIconUrl + '"/>'
		return tabElement;
	} else
		return '';
}

function addTitle(tab) {
	return '<div class="title">' + tab.title + '</div>';
}

//-----------------------------------------------------
//make a copy of the tabs when popup opened
function getTabs() {
	removeUnkownTabs();
	return $('li').clone(true);

}

//Added this because some tabs were getting stuck
//Fix for right now
function removeUnkownTabs() {
	chrome.tabs.query({}, function(tabArray) {
		//loop through all list elements
		for (var i = 0; i < $('li').length; i++) {
			var id = parseInt($('li').eq(i).attr('id'));
			var inTabs = false;
			for (tab in tabArray) {
				if (tabArray[tab].id === id) {
					inTabs = true;
					break;
				}
			}
			if (inTabs === false) {
				$('li').eq(i).remove();
			}
		}
	});
}