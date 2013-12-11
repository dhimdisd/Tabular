function init() {


	var bp = chrome.extension.getBackgroundPage();
	var tabsList = bp.getTabs();
	addTabs(tabsList);

	// $('li:nth-child(2)').addClass('highlighted');
	// 	document.searchForm.search.focus();

	// document.addEventListener("webkitvisibilitychange", handleVisibilityChange, false);
	// function handleVisibilityChange(){
	// 	if (document.webkitHidden){
	// 		chrome.tabs.getCurrent(function(tab) {
	// 			chrome.tabs.remove(tab.id);
	// 		});
	// 	}
	// }
	// // window closes when its not in focus
	$(window).blur(function() {
		// chrome.tabs.getCurrent(function(tab) {
		// 	chrome.tabs.remove(tab.id);
		// });
		window.close();
	});
	// window.onblur = function (){ this.close(); };
}

//--------------------functionality for navigating------------
function moveDown() {
	$highlighted = $('.highlighted');
	if ($highlighted.is('#tabsList > li:visible:last')) {
		$highlighted.removeClass('highlighted').siblings(':visible').first().addClass('highlighted');
		$('html, body').animate({
			scrollTop: 0
		}, 50);
	} else {
		$newHighlighted = $highlighted.removeClass('highlighted').nextAll(':visible').first().addClass('highlighted');
	}
	return $newHighlighted;
}

function moveUp() {
	$highlighted = $('.highlighted');
	if ($highlighted.is('#tabsList > li:visible:first')) {
		$highlighted.removeClass('highlighted').siblings(':visible').last().addClass('highlighted');
		$('html, body').animate({
			scrollTop: $('#tabsList').height()
		}, 50);
	} else {
		$highlighted.removeClass('highlighted').prevAll(':visible').first().addClass('highlighted');
	}
}

function addTabs(tabsList) {

	chrome.tabs.getCurrent(function(tab) {
		//if not popup
		if (tab !== undefined){
			//	removethistab
			var element = "#" + tab.id;
			tabsList = tabsList.not(element);	
		}

		tabsList.eq(1).addClass('highlighted');
		$('#tabsList').append(tabsList);
		// $('li:nth-child(2)').addClass('highlighted');
		document.searchForm.search.focus();
		$('#searchBox').on('input', startSearch);
	});



}

//-------------add some key events--------------------------------------------
window.onload = function() {
	init();
};
// document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', keyOpenWindow, false);

function keyOpenWindow(e) {
	if (e.keyCode == 13) { //enter key
		var id = parseInt($('.highlighted:first').attr('id'));
		chrome.tabs.get(id, function(tab) {
			chrome.tabs.update(tab.id, {
				'active': true,
				'highlighted': true
			});
			chrome.windows.update(tab.windowId, {
				'focused': true
			});
		});

	} else if (e.keyCode == 40) { //down key
		moveDown();
	} else if (e.keyCode == 38) { //up key
		moveUp();
	} else if (e.metaKey && (e.keyCode == 74)) { // command + j 
		moveDown();
	} else if (e.metaKey && (e.keyCode == 75)) { // command + k
		moveUp();
	} else if (e.metaKey && e.shiftKey && (e.keyCode == 68)) {
		var tabIdArray = new Array();
		$('#tabsList li:visible').each(function() {
			tabIdArray.push(parseInt($(this).attr('id'))); // command + shift + d
		});
		chrome.tabs.remove(tabIdArray);
		$('#tabsList li:visible').remove();
		document.getElementById('searchBox').value = '';
		searchField();
	} else if (e.metaKey && (e.keyCode == 68)) { // command + d
		var id = parseInt($('.highlighted:first').attr('id'));
		chrome.tabs.remove([id]);
		moveDown().prevAll(':visible').first().remove();
	} else if (e.keyCode == 222) {
		if ($('#searchBox').css('background-color').length != 0)
			$('#searchBox').css('background-color', '');
		else
			$('#searchBox').css({
				'background-color': 'lightyellow'
			});
	}
}

// $(document).bind('keydown', 'esc', function() {
//     window.close();
//  });
//------------------------Added Search features-------------------------


// document.addEventListener('DOMContentLoaded', function() {
// 	$('#searchBox').on('input', startSearch);
// });
var searchTimeout;
var strictSearch = false;

function startSearch(e) {
	if (searchTimeout != undefined) clearTimeout(searchTimeout);
	searchTimeout = setTimeout(searchField, 500);
}

function searchField() {
	var searchVal = $('#searchBox').val();
	searchVal = searchVal.replace(/ /g, '');
	var charSearch = searchVal.split('');
	for (var chars in charSearch) {
		charSearch[chars] += ".*";
	}
	searchVal = charSearch.join('');
	var regExp = new RegExp(searchVal, 'i');
	$('#tabsList .title').each(function() {
		if (regExp.test($(this).text())) {
			$(this).parent().show();
		} else
			$(this).parent().hide();
	});
	$('.highlighted').removeClass('highlighted');
	$('#tabsList > li:visible:first').addClass('highlighted');
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request === "PopUp") {
		chrome.tabs.getCurrent(function(tab) {
			sendResponse(tab);
		});
	}
});