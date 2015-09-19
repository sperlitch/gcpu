var checkInterval = 1500,
		notified = false,
		highUsage = 70,
		prevCPUinfo = false,
		percentageStats = [],
		newVar,
		high = 100;

function options() { 
	chrome.storage.sync.get({
		browserinterval: 1,
		highUsage: 70,
		checkInterval: 3300,
		duration: 120000,
		high: 100
	}, function(items) {
		duration = items.duration;
		checkInterval = items.checkInterval;
		highUsage = items.highUsage;

		high = items.high;
		console.log(items);
	});
};

function setIcon(color) {
	chrome.browserAction.setIcon({ 
		path: {
			'19': 'img/icon19-'+color+'.png',
			'38': 'img/icon38-'+color+'.png'
		}
	});
}

window.addEventListener("load", options);

chrome.storage.onChanged.addListener(options);

//chrome.notifications.onClicked.addListener(function() {
//	chrome.tabs.create({
//		url: "options.html"
//	});
//});
//
//chrome.notifications.onClosed.addListener(function() { 
//	notified = false
//});

window.addEventListener("load", function updateStats() {
	chrome.system.cpu.getInfo(function(info) {
		var totalUsage = 0,
		i = 0,
		percent = 0;

		if (prevCPUinfo) {
			for (; i < info.numOfProcessors; i++) {
				var usage = info.processors[i].usage;
				var prevUsage = prevCPUinfo.processors[i].usage;
				var user = (prevUsage.user - usage.user) / (prevUsage.total - usage.total) * 100;
				var kernel = (prevUsage.kernel - usage.kernel) / (prevUsage.total - usage.total) * 100;
				totalUsage = totalUsage + user + kernel;
			} 
		}

		currentPercent = Math.round(totalUsage / info.numOfProcessors);
		percentageStats.push(currentPercent);
		prevCPUinfo = info;
		console.log(percentageStats);

		if (percentageStats.length > 4) {
			percentageStats.shift();
			console.log(percentageStats);
			var arePercentagesHigh = percentageStats.every(function(num) {
				return num > 10;
			});
			console.log(arePercentagesHigh);
			if (arePercentagesHigh) {
				setIcon('red');
				//if ( ! notified ) {
				//	chrome.notifications.create("highcpu", {
				//		type: "progress", 
				//		title: "Simple CPU",
				//		message: "Warning! Your CPU usage is high!",
				//		iconUrl: "img/icon128.png",
				//		progress: percent
				//	}, function() { 
				//		notified = true
				//	});
				//}
				//else if (notified === true) { chrome.notifications.clear("highcpu",
				//		function() { notified = false }
				//		) }
			} else {
				setIcon('gray');
				//notified = false;
			}
		}
		//if (percent > highUsage && notified === false) {
		//	chrome.notifications.create("highcpu", {
		//		type: "progress", 
		//		title: "Simple CPU",
		//		message: "Warning! Your CPU usage is high!",
		//		iconUrl: "img/icon128.png",
		//		progress: percent
		//	}, function() { 
		//		notified = true
		//	})
		//}
		//else if (percent > highUsage && notified === true) {
		//	chrome.notifications.update("highcpu", {
		//		progress: percent
		//	}, function() { } );
		//}
		//else if (notified === true) { chrome.notifications.clear("highcpu",
		//		function() { notified = false }
		//		) }
	});
	setTimeout(updateStats, checkInterval);
});
