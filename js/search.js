$(function() {
  function startSearch(e) {
    if (searchTimeout !== undefined) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchField, 500);
  }

  function searchField() {
    var searchVal = $searchBox.val();
    var searchRgx = new RegExp(searchVal.replace(/(.)/g, '$1' + '.*'));

    $tabList.find('li').each(function() {
      var $this = $(this);
      var $title = $this.find('.title');
      var $url = $this.find('.url');
      var titleAndUrl = $title.text() + '``' + $url.text();
      var highlightedText = [];

      if (searchRgx.test(titleAndUrl)) {
        highlightedText =
          getFormattedSearchText(searchVal, titleAndUrl).split('``');

        $title.html(highlightedText[0]);
        $url.html(highlightedText[1]);
        $this.show();
      } else {
        $this.hide();
      }
      $('.highlighted').removeClass('highlighted');
      $tabList.find('li:first').addClass('highlighted');
    });
  }

  function getFormattedSearchText(searchString, text) {
    var textArray = text.split('');
    var charSearchArray = searchString.replace(/ /g, '').split('');
    var lastIndex = charSearchArray.length - 1;
    var index = 0;

    for (var i in textArray) {
      if (index <= lastIndex) {
        if (charSearchArray[index].toUpperCase() === textArray[i].toUpperCase()) {

          textArray[i] = '<strong style="color:red">' + textArray[i] + '</strong>';
          index++;
        }
      } else {
        break;
      }
    }

    return textArray.join('');
  }

  var $searchBox = $('#searchBox');
  var $tabList = $('#tabsList');
  var searchTimeout;
  var strictSearch = false;

  document.searchForm.search.focus();
  $searchBox.on('input', startSearch);
});
