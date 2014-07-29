$(function() {
  document.addEventListener('keydown', function(e) {
    function moveDown() {
      var $highlighted = $('.highlighted');
      if ($highlighted.is('#tabsList > li:last')) {
        $highlighted
          .removeClass('highlighted')
          .siblings()
          .first()
          .addClass('highlighted');
      } else {
        $highlighted
          .removeClass('highlighted')
          .next()
          .addClass('highlighted');
      }

      $highlighted = $('.highlighted'); // update new highlighted tab item
      if (!$highlighted.isOnScreen()) {
        $highlighted.goTo();
      }
    }

    function moveUp() {
      var $highlighted = $('.highlighted');
      if ($highlighted.is('#tabsList > li:first')) {
        $highlighted
          .removeClass('highlighted')
          .siblings()
          .last()
          .addClass('highlighted');
      } else {
        $highlighted
          .removeClass('highlighted')
          .prev()
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
    } else if (e.metaKey && e.shiftKey && (e.keyCode == KeyCode.D)) {
      var $tabListItems = $('#tabsList > li');
      var tabIds =
        $tabListItems
          .map(function() { return parseInt(this.id, 10); })
          .toArray();

      chrome.tabs.remove(tabIds);
      $tabListItems.remove();
      document.getElementById('searchBox').value = '';

    // remove tab
    } else if (e.metaKey && (e.keyCode == KeyCode.D)
            || (e.ctrlKey && e.keyCode == KeyCode.D)
            || (e.keyCode == KeyCode.DELETE)) {

      var $oldHighlighted = $('.highlighted');
      chrome.tabs.remove(parseInt($oldHighlighted.attr('id'), 10));

      //move highleted down and delete previous tab
      moveDown();
      $oldHighlighted.remove();
    }
  }, false);
});
