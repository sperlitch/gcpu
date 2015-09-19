var app = true;

chrome.storage.sync.get({
	// me
	duration: 120000,
	checkInterval: 1000,
	highUsage: 70
}, function(items) {
	// me
	document.querySelector("#checkInterval").value = items.checkInterval / 1000;
	document.querySelector("#highUsage").value = items.highUsage;
	document.querySelector("#duration").value = items.duration / 60000;
	console.log('options.js');
	console.log(items);
});

chrome.system.cpu.getInfo(function(info) {
	document.querySelector("#processors").innerText = info.numOfProcessors;
});

document.querySelector("form").addEventListener("submit", function(event) {
	event.preventDefault();

	// SET
	chrome.storage.sync.set({
		checkInterval: document.querySelector("#checkInterval").value * 1000,
		highUsage: document.querySelector('#highUsage').value,
		duration: document.querySelector('#duration').value * 60000
	}, function() {
		document.querySelector("input[type='submit']").value = "Saved sucessfully";
		setTimeout(function() { 
			document.querySelector("input[type='submit']").value = "Save"
		}, 2000);
	} );
});


document.querySelector("form").addEventListener("reset", function(event) {
  event.preventDefault();
  var reset = confirm("Are you sure you want to reset all options?");
  if (reset == true) {
    chrome.storage.sync.clear(function() { chrome.tabs.reload()});
} });
