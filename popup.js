
function init(){
	var bp = chrome.extension.getBackgroundPage();
	$('#tabsList').append(bp.getTabs());
	removeThisTab();
	$('li:nth-child(2)').addClass('highlighted');
	document.searchForm.search.focus();
}
//Get it started

//add some key events
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
	else if (e.metaKey && (e.keyCode == 68)){
		var id = parseInt($('.highlighted:first').attr('id'));
		chrome.tabs.remove([id]);
		moveDown().prev().remove();
	}
}


$(window).blur(function(){
	window.close();	
});

function moveDown(){
	$highlighted = $('.highlighted');
	if ($highlighted.is(':last-child')){
		$highlighted.removeClass('highlighted').siblings().first().addClass('highlighted');
		$('html, body').animate({scrollTop:0}, 50);
	}
	else {
		 $newHighlighted= $highlighted.removeClass('highlighted').next().addClass('highlighted');
	}
	return $newHighlighted;
}

function moveUp(){
	$highlighted = $('.highlighted');
	if ($highlighted.is(':first-child')){
		$highlighted.removeClass('highlighted').siblings().last().addClass('highlighted');
		$('html, body').animate({scrollTop: $('#tabsList').height()}, 50);
	}
	else {
		$highlighted.removeClass('highlighted').prev().addClass('highlighted');
	}	
}

function removeThisTab(){
	$firstList = $('li:first-child .title');
	// var bp = chrome.extension.getBackgroundPage();
	// bp.consoleThis($firstList);
	if ($firstList.html() == "" || ($firstList.html()=="tabular"){
		$firstList.parent().remove();
	}
}


// $(document).bind('keydown', 'esc', function() {
//     window.close();
//  });