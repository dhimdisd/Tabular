//add search functionality
(function() {

    document.searchForm.search.focus();
    $('#searchBox').on('input', startSearch);

    var searchTimeout;
    var strictSearch = false;

    function startSearch(e) {
        if (searchTimeout !== undefined) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchField, 500);
    }

    function searchField() {
        var searchVal = $('#searchBox').val();
        searchVal = searchVal.replace(/ /g, '');
        var charSearch = searchVal.split('');
        for (var chars in charSearch) {
            charSearch[chars] += ".*";
        }
        searchVal = charSearch.join('');
        var regExp = new RegExp(searchVal, 'i');
        $('#tabsList .title').each(function() {
            if (regExp.test($(this).text())) {
                $(this).parent().show();

                var highlightedText =
                    getFormattedSearchText($('#searchBox').val(), $(this).text());

                $(this).text('');
                $(this).append(highlightedText);
            } else
                $(this).parent().hide();
        });
        $('.highlighted').removeClass('highlighted');
        $('#tabsList > li:visible:first').addClass('highlighted');
    }


    function getNonExactRegex(searchString) {

        var regExp = new RegExp(searchString, 'i');
        return regExp;
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
})();