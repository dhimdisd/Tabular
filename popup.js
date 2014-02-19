
window.onload = function init() {

	var bp = chrome.extension.getBackgroundPage();
	var tabsList = bp.getTabs(addTabs);
	// addTabs(tabsList);

	$(window).blur(function() {
		window.close();
	});
	
	function addTabs(tabsList) {

		chrome.tabs.getCurrent(function(tab) {
			//if not popup
			if (tab !== undefined){
				//	remove this tab from the list
				var element = "#" + tab.id;
				tabsList = tabsList.not(element);
			}

			tabsList.eq(1).addClass('highlighted');
			$('#tabsList').append(tabsList);
			// $('li:nth-child(2)').addClass('highlighted');
			document.searchForm.search.focus();
			
			//add search functionality
			$('#searchBox').on('input', startSearch);


		});

	}	
};

//--------------------functionality for navigating------------

//-------------add some key events--------------------------------------------

// document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', function(e){

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
				window.close();
			});


		}
		else if (e.keyCode == 40) { //down key
			moveDown();
		}
		else if (e.keyCode == 38) { //up key
			moveUp();
		}
		else if (e.metaKey && (e.keyCode == 74)) { // command + j 
			moveDown();
		}
		else if (e.metaKey && (e.keyCode == 75)) { // command + k
			moveUp();
		}
		//delete all visible tabs
		else if (e.metaKey && e.shiftKey && (e.keyCode == 68)) { // command + shift + d
			var tabIdArray = [];
			$('#tabsList li:visible').each(function() {
				tabIdArray.push(parseInt($(this).attr('id')));
			});
			chrome.tabs.remove(tabIdArray);
			$('#tabsList li:visible').remove();
			document.getElementById('searchBox').value = '';
			searchField();
		}
		//delete tab that is highlighted
		else if (e.metaKey && (e.keyCode == 68)) { // command + d
			var id = parseInt($('.highlighted:first').attr('id'));
			chrome.tabs.remove([id]);
			//move highleted down and delete previous tab
			moveDown().prevAll(':visible').first().remove();
		} else if (e.keyCode == 222) {
			if ($('#searchBox').css('background-color').length !== 0)
				$('#searchBox').css('background-color', '');
			else
				$('#searchBox').css({
					'background-color': 'lightyellow'
				});
		}

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
}, false);


//------------------------Added Search features-------------------------

var searchTimeout;
var strictSearch = false;

function startSearch(e) {
	if (searchTimeout !== undefined) clearTimeout(searchTimeout);
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