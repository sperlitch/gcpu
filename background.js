(function() {
  var s,   
  CPU = {

    settings: {
      delay: 0,
      duration: 12,
      intervals: 4,
      checkInterval: 3,
      highUsage: 70,
    }, 

    init: function() {
      s = this.settings;
      this.percentageStats = [];
      this.prevCPUinfo = null,
      this.setOptions();
    },

    setOptions: function() {
      var self = this;
      chrome.alarms.onAlarm.addListener(function( alarmInfo ) {
        self.updateStats();
      });
      chrome.storage.sync.get({
        highUsage:      s.highUsage,
        duration:       s.duration,
        checkInterval:  s.checkInterval,
      }, function(syncedItems) {
        s.duration =      syncedItems.duration;
        s.checkInterval = syncedItems.checkInterval;
        s.highUsage =     syncedItems.highUsage;
        self.setAlarm();
      });
      chrome.storage.onChanged.addListener(function() {
        chrome.storage.sync.get({
          highUsage:      s.highUsage,
          duration:       s.duration,
          checkInterval:  s.checkInterval,
        }, function(syncedItems) {
          s.duration =      syncedItems.duration;
          s.checkInterval = syncedItems.checkInterval;
          s.highUsage =     syncedItems.highUsage;
          self.setAlarm();
        });
      });
    },

    setAlarm: function() {
      var self = this;
      chrome.alarms.clear('updateStats');
      chrome.alarms.create('updateStats', {
        delayInMinutes:  s.delay,
        periodInMinutes: s.checkInterval
      });
    },

    updateStats: function() {
      var self =  this,
                  totalUsage = 0,
                  i = 0,
                  percent = 0,
                  arePercentagesHigh = false;

      console.log('Updating cpu stats...');

      chrome.system.cpu.getInfo(function(info) {
        if (self.prevCPUinfo) {
          for (; i < info.numOfProcessors; i++) {
            var usage = info.processors[i].usage;
            var prevUsage = self.prevCPUinfo.processors[i].usage;
            var user = (prevUsage.user - usage.user) / (prevUsage.total - usage.total) * 100;
            var kernel = (prevUsage.kernel - usage.kernel) / (prevUsage.total - usage.total) * 100;
            totalUsage += user + kernel;
          } 
        } else {
          self.prevCPUinfo = info;
          return;
        }

        currentPercent = Math.round(totalUsage / info.numOfProcessors);
        self.percentageStats.push(currentPercent);
        self.prevCPUinfo = info;
        chrome.browserAction.setTitle({ 
          title: "using " + currentPercent + "% cpu"
        });

        console.log(self.percentageStats);

        if (self.percentageStats.length > s.intervals) {
          self.percentageStats.shift();
          arePercentagesHigh = self.percentageStats.every(function(num) {
            return num > s.highUsage;
          });
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
