(function(w, $) {
  $(function() {
    var bp = chrome.extension.getBackgroundPage();
    var $tabList = $('#tabsList');

    function fetchTabs() { w.tabs = bp.tabs; }

    function interpolate(template, terms) {
      var keyRgx;
      for (var key in terms) {
        keyRgx = new RegExp('{{' + key + '}}', 'g');
        template = template.replace(keyRgx, terms[key]);
      }

      return template;
    }

    function insertTabListItem(tab) {
      var tabListItemTemplate =
        '<div class="favIconContainer"><img src="{{favIconUrl}}"></div> \
          <section class="tabDetails"> \
            <h2 class="title">{{title}}</h2> \
            <p class="url">{{url}}</p> \
        </section>';

      var $tabListItem = $('<li>').attr('id', tab.id);
      $tabListItem.html(interpolate(tabListItemTemplate, {
        favIconUrl: tab.favIconUrl,
        title: tab.title,
        url: tab.url
      }));


      $tabList.append($tabListItem);


      // set up tab event handlers
      $tabListItem.on('mouseover', function() {
        $(this)
          .addClass('highlighted')
          .siblings()
          .removeClass('highlighted');
      });

      $tabListItem.on('click', function() {
        chrome.tabs.update(tab.id, {
          'active': true,
          'highlighted': true
        });

        chrome.windows.update(tab.windowId, { 'focused': true });
      });
    }

    function updateTabListItem(tab) {
      var $tab = $('#' + tab.id);
      if (tab.status === 'complete') {
        $tab.find('img').attr('src', tab.favIconUrl);
        $tab.find('.title').text(tab.title);
        $tab.find('.url').text(tab.url);
      }
    }

    // initialize tab list view
    fetchTabs();
    w.tabs.forEach(function(tab) {
      insertTabListItem(tab);
    });
    if ($tabList.find('li:nth(1)').length > 1) {
      $tabList.find('li:nth(1)').addClass('highlighted');
    } else {
      $tabList.find('li:nth(0)').addClass('highlighted');
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.event === 'tabCreated') {
        fetchTabs();
        insertTabListItem(w.tabs[0]);
      } else if (request.event === 'tabRemoved') {
        fetchTabs();
        $('li#id' + request.tabId).remove();
      } else if (request.event === 'tabUpdated') {
        fetchTabs();
        updateTabListItem(request.tab);
      } else if (request.event === 'tabActivated') {
        fetchTabs();
        $tabList.prepend($('#' + request.tabId).detach());
      }
    });
  });
})(window, jQuery);
