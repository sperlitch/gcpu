(function() {
  var s,   
  CPU = {

    settings: {
      delay: 0.1,
      duration: 12,
      intervals: 4,
      checkInterval: 3,
      highUsage: 70,
      notification: true,
      userHasBeenNotified: false
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
        notification:   s.notification
      }, function(syncedItems) {
        s.duration =      syncedItems.duration;
        s.checkInterval = syncedItems.checkInterval;
        s.highUsage =     syncedItems.highUsage;
        s.notification =  syncedItems.notification;
        self.setAlarm();
      });
      chrome.storage.onChanged.addListener(function() {
        chrome.storage.sync.get({
          highUsage:      s.highUsage,
          duration:       s.duration,
          checkInterval:  s.checkInterval,
          notification:   s.notification
        }, function(syncedItems) {
          s.duration =      syncedItems.duration;
          s.checkInterval = syncedItems.checkInterval;
          s.highUsage =     syncedItems.highUsage;
          s.notification =  syncedItems.notification;
          self.updateStats();
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
          console.log('Initial update');
          self.prevCPUinfo = info;
          return;
        }

        currentPercent = Math.round(totalUsage / info.numOfProcessors);
        if (currentPercent > -1) {
          self.percentageStats.push(currentPercent);
          chrome.browserAction.setTitle({ 
            title: "using " + currentPercent + "% cpu"
          });
        }
        self.prevCPUinfo = info;

        console.log(self.percentageStats);

        if (self.percentageStats.length >= s.intervals) {
          arePercentagesHigh = self.percentageStats.every(function(num) {
            return num > s.highUsage;
          });
          if (arePercentagesHigh) {
            self.setIcon('red');
            if (s.notification && ! s.userHasBeenNotified) {
              self.notifyUser();
              s.userHasBeenNotified = true;
            }
          } else {
            self.setIcon('gray');
            chrome.notifications.clear('highcpu');
            s.userHasBeenNotified = false;
          }
          self.percentageStats.shift();
        }
      });
    },

    notifyUser: function() {
      chrome.notifications.create("highcpu", {
        type: "basic",
        title: "CPU Icon",
        message: "Your CPU usage has been over " + s.highUsage + "% for " + s.duration + " minutes.",
        iconUrl: "img/icon38-red.png"
      }, function(id) {
        s.userHasBeenNotified = true;
      });
      chrome.notifications.update('highcpu', {}, function() {});
      chrome.notifications.onClosed.addListener(function() {
        s.userHasBeenNotified = false;
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
