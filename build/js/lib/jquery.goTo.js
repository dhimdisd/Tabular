(function($) {
  $.fn.goTo = function() {
    $('html, body').animate({
      scrollTop: $(this).offset().top - 43 + 'px' // hack
    }, 'fast');
    return this; // for chaining...
  };
})(jQuery);
