(function($) {
  $.fn.isOnScreen = function() {

    var win = $(window);

    var viewport = {
      top: win.scrollTop() + 43, // hack
      left: win.scrollLeft()
    };
    viewport.right = viewport.left + window.innerWidth;
    viewport.bottom = viewport.top + window.innerHeight;

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    //The whole element has to be in the viewport
    return (!(viewport.right < bounds.right || viewport.left > bounds.left || viewport.bottom < bounds.bottom || viewport.top > bounds.top));

  };

})(jQuery);
