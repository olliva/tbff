(function() {
	


	$('.subscribeInput input[type="text"]').each(function(index, element) {
		var $element = $(element);
		var defaultValue = $element.val();

		$element.focus(function() {
			var actualValue = $element.val();
			if (actualValue == defaultValue) {
				$element.val('');
				$element.css('color', '#b2b09f');
			}
		});
		$element.blur(function() {
			var actualValue = $element.val();
			if (!actualValue) {
				$element.val(defaultValue);
				$element.css('color', '#b2b09f');
			}
		});
	});
	
}());