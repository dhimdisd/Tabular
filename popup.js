
function init(){
	var bp = chrome.extension.getBackgroundPage();
	$('#tabsList').append(bp.getTabs());
	removeThisTab();
	$('li:nth-child(2)').addClass('highlighted');
	document.searchForm.search.focus();
	
	//window closes when its not in focus
	$(window).blur(function(){
		window.close();	
	});
}

//--------------------functionality for navigating------------
function moveDown(){
	$highlighted = $('.highlighted');
	if ($highlighted.is('#tabsList > li:visible:last')){
		$highlighted.removeClass('highlighted').siblings(':visible').first().addClass('highlighted');
		$('html, body').animate({scrollTop:0}, 50);
	}
	else {
		 $newHighlighted= $highlighted.removeClass('highlighted').nextAll(':visible').first().addClass('highlighted');
	}
	return $newHighlighted;
}

function moveUp(){
	$highlighted = $('.highlighted');
	if ($highlighted.is('#tabsList > li:visible:first')){
		$highlighted.removeClass('highlighted').siblings(':visible').last().addClass('highlighted');
		$('html, body').animate({scrollTop: $('#tabsList').height()}, 50);
	}
	else {
		$highlighted.removeClass('highlighted').prevAll(':visible').first().addClass('highlighted');
	}	
}

function removeThisTab(){
	$firstList = $('li:first-child .title');
	if ($firstList.html() == "" || ($firstList.html()=="tabular")){
		$firstList.parent().remove();
	}
}

//-------------add some key events--------------------------------------------
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', keyOpenWindow, false);
function keyOpenWindow (e){
	if(e.keyCode == 13){
		var id = parseInt($('.highlighted:first').attr('id'));
		chrome.tabs.update(id, {'active': true}, function(activeTab){});
	}
	else if(e.keyCode == 40){
		moveDown();
	}	
	else if (e.keyCode == 38) {
		moveUp();
	}
	else if (e.metaKey && (e.keyCode == 74)){
		moveDown();	
	}
	else if (e.metaKey && (e.keyCode == 75)){
		moveUp();
	}
	else if (e.metaKey && e.shiftKey && (e.keyCode == 68)){
		var tabIdArray = new Array();
		$('#tabsList li:visible').each(function(){
			tabIdArray.push(parseInt($(this).attr('id')));
		});
		chrome.tabs.remove(tabIdArray);
		$('#tabsList li:visible').remove();
		document.getElementById('searchBox').value = '';
		searchField();
	}
	else if (e.metaKey && (e.keyCode == 68)){
		var id = parseInt($('.highlighted:first').attr('id'));
		chrome.tabs.remove([id]);
		moveDown().prevAll(':visible').first().remove();
	}
}

// $(document).bind('keydown', 'esc', function() {
//     window.close();
//  });
//------------------------Added Search features-------------------------
document.addEventListener('DOMContentLoaded', function () {
  // document.querySelector('input').addEventListener('keypress', startSearch);
  $('#searchBox').on('input', startSearch);
});
var searchTimeout;
function startSearch(e) {
	// searchField(e);
    if (searchTimeout != undefined) clearTimeout(searchTimeout);
    	searchTimeout = setTimeout(searchField, 500);
}

function searchField(){
	var searchVal = $('#searchBox').val();
	searchVal = searchVal.replace(/ /g, '');
	var charSearch = searchVal.split('');
	for(var chars in charSearch){
		charSearch[chars] += ".*";
	}
	searchVal = charSearch.join('');
	var regExp = new RegExp(searchVal, 'i');
	$('#tabsList .title').each(function (){
		if(regExp.test($(this).text())){
			$(this).parent().show();
		}
		else
			$(this).parent().hide();
	});
	$('.highlighted').removeClass('highlighted');
	$('#tabsList > li:visible:first').addClass('highlighted');
}





 