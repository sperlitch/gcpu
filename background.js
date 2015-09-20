(function() {
	var delay = 0.1,
			duration = 1,
			intervals = 4,
			checkInterval = duration / intervals,
			highUsage = 70,
			prevCPUinfo = false,
			percentageStats = [];

	function options() { 
		chrome.storage.sync.get(
				{
					highUsage: highUsage,
					duration: duration,
					checkInterval: checkInterval,
				},
				function(items) {
					duration = items.duration;
					checkInterval = items.checkInterval;
					highUsage = items.highUsage;
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

	function updateStats() {
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

			chrome.browserAction.setTitle({ 
				title: "Using " + currentPercent + "%"
			});

			if (percentageStats.length > intervals) {
				percentageStats.shift();
				console.log(percentageStats);
				var arePercentagesHigh = percentageStats.every(function(num) {
					return num > highUsage;
				});
				console.log(arePercentagesHigh);
				if (arePercentagesHigh) {
					setIcon('red');
				} else {
					setIcon('gray');
				}
			}
		});
	}

	window.addEventListener("load", options);
	chrome.storage.onChanged.addListener(options);

	chrome.alarms.create('updateStats', {
		delayInMinutes: delay,
		periodInMinutes: checkInterval
	});

	chrome.alarms.onAlarm.addListener(function( alarmInfo ) {
		updateStats();
	});
})();
