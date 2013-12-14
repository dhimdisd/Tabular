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
			window.close();
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
