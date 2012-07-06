function searchField(){
	// var searchVal= $('#searchBox').val
	
}

function searchTimerTick(){

}

var searchTimeout;
document.getElementById('searchBox').onkeypress = function () {
    if (searchTimeout != undefined) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchField(), 250);
}


    function callServerScript() {
        // your code here
}