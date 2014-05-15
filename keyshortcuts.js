document.addEventListener('keydown', function(e) {

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


    } else if (e.keyCode == 40) { //down key
        moveDown();
    } else if (e.keyCode == 38) { //up key
        moveUp();
    } else if ((e.metaKey && (e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 74)) { // command + j 
        moveDown();
    } else if (e.metaKey && (e.keyCode == 75) || (e.ctrlKey && e.keyCode == 75)) { // command + k
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
    else if (e.metaKey && (e.keyCode == 68) || (e.ctrlKey && e.keyCode == 68) || (e.keyCode == 46)) { // command + d
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


            // $('html, body').animate({
            //     scrollTop: 0
            // }, 50);
        } else {
            $highlighted.removeClass('highlighted').nextAll(':visible').first().addClass('highlighted');
        }

        if (!$('.highlighted').isOnScreen()) {
            $('.highlighted').goTo();
        }
    }

    function moveUp() {
        $highlighted = $('.highlighted');
        if ($highlighted.is('#tabsList > li:visible:first')) {
            $highlighted.removeClass('highlighted').siblings(':visible').last().addClass('highlighted');
            // $('html, body').animate({
            //     scrollTop: $('#tabsList').height()
            // }, 50);
        } else {
            $highlighted.removeClass('highlighted').prevAll(':visible').first().addClass('highlighted');
        }

        if (!$('.highlighted').isOnScreen()) {
            $('.highlighted').goTo();
        }
    }
}, false);