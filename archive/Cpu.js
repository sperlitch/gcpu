var CPU = (function() {

    var prevCPUinfo = false;
    var settings = {
      delay: 0.1,
      duration: 1,
      intervals: 4,
      checkInterval: 0.25,
      highUsage: 5,
    }; 

    var updateStats = function() {
      chrome.system.cpu.getInfo(function(info) {
        if (prevCPUinfo) {
          for (; i < info.numOfProcessors; i++) {
            var usage = info.processors[i].usage;
            var prevUsage = prevCPUinfo.processors[i].usage;
            var user = (prevUsage.user - usage.user) / (prevUsage.total - usage.total) * 100;
            var kernel = (prevUsage.kernel - usage.kernel) / (prevUsage.total - usage.total) * 100;
            totalUsage += user + kernel;
          } 
        }

        currentPercent = Math.round(totalUsage / info.numOfProcessors);
        self.percentageStats.push(currentPercent);
        self.prevCPUinfo = info;
        console.log(self.percentageStats);
        chrome.browserAction.setTitle({ 
          title: "using " + currentPercent + "% cpu"
        });

        if (self.percentageStats.length > s.intervals) {
          self.percentageStats.shift();
          console.log(self.percentageStats);
          arePercentagesHigh = self.percentageStats.every(function(num) {
            return num > s.highUsage;
          });
          console.log(arePercentagesHigh);
          if (arePercentagesHigh) {
            self.setIcon('red');
          } else {
            self.setIcon('gray');
          }
        }
      });
    },
  var settings = {


})();


(function() {
  var s,   
  CPU = {
    test: function() {
      alert('cpu test');
    },

    settings: {
      delay: 0.1,
      duration: 1,
      intervals: 4,
      checkInterval: 0.25,
      highUsage: 5,
    }, 

    init: function() {
      s = this.settings;
      this.percentageStats = [];
      this.prevCPUinfo = null,
      this.setOptions();
      this.setOnOptionsChange();
      this.setAlarm();
    },

    setOptions: function() {
      chrome.storage.sync.get({
        highUsage:      s.highUsage,
        duration:       s.duration,
        checkInterval:  s.checkInterval,
      }, function(syncedItems) {
        s.duration =      syncedItems.duration;
        s.checkInterval = syncedItems.checkInterval;
        s.highUsage =     syncedItems.highUsage;
        console.log(syncedItems);
      });
    },

    setOnOptionsChange: function() {
      chrome.storage.onChanged.addListener(
        function() {
          chrome.storage.sync.get({
            highUsage:      s.highUsage,
            duration:       s.duration,
            checkInterval:  s.checkInterval,
          }, function(syncedItems) {
            s.duration =      syncedItems.duration;
            s.checkInterval = syncedItems.checkInterval;
            s.highUsage =     syncedItems.highUsage;
            console.log(syncedItems);
          })
        }
      );
    },

    setAlarm: function() {
      var self = this;
      chrome.alarms.create('updateStats', {
        delayInMinutes:  s.delay,
        periodInMinutes: s.checkInterval
      });
      chrome.alarms.onAlarm.addListener(function( alarmInfo ) {
        self.updateStats();
      });
    },

    updateStats: function() {
      console.log(this.settings);
      var self = this,
          totalUsage = 0,
          i = 0,
          percent = 0,
          arePercentagesHigh = false;

      chrome.system.cpu.getInfo(function(info) {
        if (self.prevCPUinfo) {
          for (; i < info.numOfProcessors; i++) {
            var usage = info.processors[i].usage;
            var prevUsage = self.prevCPUinfo.processors[i].usage;
            var user = (prevUsage.user - usage.user) / (prevUsage.total - usage.total) * 100;
            var kernel = (prevUsage.kernel - usage.kernel) / (prevUsage.total - usage.total) * 100;
            totalUsage += user + kernel;
          } 
        }

        currentPercent = Math.round(totalUsage / info.numOfProcessors);
        self.percentageStats.push(currentPercent);
        self.prevCPUinfo = info;
        console.log(self.percentageStats);
        chrome.browserAction.setTitle({ 
          title: "using " + currentPercent + "% cpu"
        });

        if (self.percentageStats.length > s.intervals) {
          self.percentageStats.shift();
          console.log(self.percentageStats);
          arePercentagesHigh = self.percentageStats.every(function(num) {
            return num > s.highUsage;
          });
          console.log(arePercentagesHigh);
          if (arePercentagesHigh) {
            self.setIcon('red');
          } else {
            self.setIcon('gray');
          }
        }
      });
    },

    setIcon: function(color) {
      chrome.browserAction.setIcon({ 
        path: {
          '19': 'img/icon19-'+color+'.png',
          '38': 'img/icon38-'+color+'.png'
        }
      });
    }
  }

  CPU.init();

}());
