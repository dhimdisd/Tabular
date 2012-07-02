
function init(){
	// console.log("hello");
	var bg = chrome.extension.getBackgroundPage();
	$('#tabsList').append(bg.getTabs());
	// var doc = chrome.extension.getBackgroundPage().document;
	// console.log($(doc).find('li'));
	// $('#tabsList').append($(doc).find('li'));

	// console.log(chrome.extension.getBackgroundPage().document);
	// window.location.href = "chrome-extension://fiibiiflmgmifcfkdemgepcgjiememej/background.html";
	 // $(window.document).replaceWith(chrome.extension.getBackgroundPage().document.$());	
}

// function (listItems){
// 	for(li in listItems){
		
// 	}
// }
document.addEventListener('DOMContentLoaded', init);

