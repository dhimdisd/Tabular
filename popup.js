window.onload = function init() {

    var bp = chrome.extension.getBackgroundPage();
    var tabsList = bp.getTabs(addTabs);

	$(window).blur(function() {
		window.close();
	});
	
	function addTabs(tabsList) {

        chrome.tabs.getCurrent(function(tab) {
            //if not popup
            if (tab !== undefined) {
                //	remove this tab from the list
                var element = "#" + tab.id;
                tabsList = tabsList.not(element);
            }

            tabsList.eq(1).addClass('highlighted');
            $('#tabsList').append(tabsList);

        });

    }
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request === "PopUp") {
        chrome.tabs.getCurrent(function(tab) {
            sendResponse(tab);
        });
    }
});

//JQuery Plugins
(function($) {
    $.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    };

    $.fn.isOnScreen = function() {

        var win = $(window);

        var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = this.offset();
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        //The whole element has to be in the viewport
        return (!(viewport.right < bounds.right || viewport.left > bounds.left || viewport.bottom < bounds.bottom || viewport.top > bounds.top));

    };

})(jQuery);