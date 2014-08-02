$(function() {
  document.addEventListener('keydown', function(e) {
    function moveDown() {
      var $highlighted = $('.highlighted');
      if ($highlighted.is('#tabsList > li:visible:last')) {
        $highlighted
          .removeClass('highlighted')
          .siblings(':visible')
          .first()
          .addClass('highlighted');
      } else {
        $highlighted
          .removeClass('highlighted')
          .nextAll(':visible')
          .first()
          .addClass('highlighted');
      }

      $highlighted = $('.highlighted'); // update new highlighted tab item
      if (!$highlighted.isOnScreen()) {
        $highlighted.goTo();
      }
    }

    function moveUp() {
      var $highlighted = $('.highlighted');
      if ($highlighted.is('#tabsList > li:visible:first')) {
        $highlighted
          .removeClass('highlighted')
          .siblings(':visible')
          .last()
          .addClass('highlighted');
      } else {
        $highlighted
          .removeClass('highlighted')
          .prevAll(':visible')
          .first()
          .addClass('highlighted');
      }

      $highlighted = $('.highlighted'); // update new highlighted tab item
      if (!$highlighted.isOnScreen()) {
        $highlighted.goTo();
      }
    }

    var id;
    var KeyCode = {
      ENTER: 13,
      DOWN: 40,
      UP: 38,
      J: 74,
      K: 75,
      D: 68,
      DELETE: 46
    };

    // go to highlighted tab
    if (e.keyCode === KeyCode.ENTER) {
      id = parseInt($('.highlighted').attr('id'), 10);
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

    // move highlighted selection up
    } else if ((e.keyCode == KeyCode.DOWN)
              || (e.metaKey && (e.keyCode == KeyCode.J))
              || (e.ctrlKey && e.keyCode == KeyCode.J)) {

      moveDown();

    // move highlighted selection down
    } else if ((e.keyCode == KeyCode.UP)
              || (e.metaKey && (e.keyCode == KeyCode.K))
              || (e.ctrlKey && e.keyCode == KeyCode.K)) {

      moveUp();

    // remove all visible tabs
    } else if (e.metaKey && e.shiftKey && (e.keyCode == KeyCode.D)) {
      //$('#tabsList > li:visible .close-btn').each(function(index, el) {
        //$(el).click();
      //})

    // remove tab
    } else if (e.metaKey && (e.keyCode == KeyCode.D)
            || (e.ctrlKey && e.keyCode == KeyCode.D)
            || (e.keyCode == KeyCode.DELETE)) {

      $('.highlighted .close-btn').click();
    }
  }, false);
});
