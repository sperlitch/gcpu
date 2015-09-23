(function() {

  var s,
  Opts = {

    settings: {
      delay: 1,
      duration: 12,
      intervals: 4,
      checkInterval: 3,
      highUsage: 70,
      notification: true
    }, 

    elements: {
      form:           document.querySelector('form'),
      highUsage:      document.querySelector('#highUsage'),
      duration:       document.querySelector('#duration'),
      notification:   document.querySelector('#notification'),
      flash:          document.querySelector('.alert')
    },

    init: function() {
      s = this.settings;
      el = this.elements;
      this.bindUIActions();
      this.setInputVals();
    },

    bindUIActions: function() {
      var self = this;
      el.form.addEventListener('submit', function(event) {
        self.setStorage(event);
      });
      el.form.addEventListener('reset', function(event) {
        self.clearStorage(event);
        self.setDefaults();
      });
    },

    setInputVals: function() {
      chrome.storage.sync.get({
        highUsage:    s.highUsage,
        duration:     s.duration,
        notification: s.notification
      }, function(syncedItems) {
        el.highUsage.value =      syncedItems.highUsage;
        el.duration.value =       syncedItems.duration;
        el.notification.checked = syncedItems.notification;
      });
    },

    setStorage: function(event) {
      var self = this;
      event.preventDefault();
      if ( el.duration.value < 1 ) {
        alert('Duration must be greater than 1 minute');
        return;
      }
      chrome.storage.sync.set({
        highUsage: el.highUsage.value,
        duration: el.duration.value,
        checkInterval: el.duration.value / 4,
        notification: el.notification.checked
      }, function() {
        self.flash();
      });
    },

    clearStorage: function(event) {
      var self = this;
      event.preventDefault();
      chrome.storage.sync.clear(function(){
        self.flash();
      });
    },

    setDefaults: function() {
      var self = this;
      chrome.storage.sync.set({
        checkInterval: s.checkInterval,
        highUsage: s.highUsage,
        duration: s.duration,
        notification: s.notification
      }, function() {
        el.highUsage.value =  s.highUsage;
        el.duration.value =   s.duration;
        el.notification.checked = s.notification
        self.flash();
      });
    },

    flash: function() {
      el.flash.style.display = 'block';
      window.setTimeout(function() {
        el.flash.style.display = 'none';
      }, 2000);
    }

  }

  Opts.init();

}());
