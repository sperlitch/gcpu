(function() {
	var duration = 1,
			intervals = 4,
			checkInterval = duration / intervals,
			highUsage = 70,
			$ = function(el) { return document.querySelector(el); };

	chrome.storage.sync.get(
			{
				highUsage: highUsage,
				duration: duration,
				checkInterval: checkInterval,
			},
			function(items) {
				$("#highUsage").value = items.highUsage;
				$("#duration").value = items.duration;
				console.log('options.js', items);
			}
	);

	$("form").addEventListener("submit", function(event) {
		event.preventDefault();
		if ( $('#duration').value < 1 ) {
			alert('Duration must be greater than 1');
			return;
		}
		chrome.storage.sync.set({
			checkInterval: $("#duration").value / 4,
			highUsage: $('#highUsage').value,
			duration: $('#duration').value
		}, function() {
			$("input[type='submit']").value = "Saved sucessfully";
			setTimeout(function() { 
				$("input[type='submit']").value = "Save"
			}, 2000);
		} );
	});

	$("form").addEventListener("reset", function(event) {
		event.preventDefault();
		var reset = confirm("Are you sure you want to reset all options?");
		if (reset == true) {
			chrome.storage.sync.clear(function() { chrome.tabs.reload()});
		} });

})();
