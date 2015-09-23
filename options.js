(function() {

  var s,
  Opts = {

    settings: {
      delay: 0.1,
      duration: 1,
      intervals: 4,
      checkInterval: 0.25,
      highUsage: 5,
    }, 

    elements: {
      form:       document.querySelector('form'),
      highUsage:  document.querySelector('#highUsage'),
      duration:   document.querySelector('#duration'),
      flash:      document.querySelector('.alert')
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
        highUsage:  s.highUsage,
        duration:   s.duration,
      }, function(syncedItems) {
        el.highUsage.value =  syncedItems.highUsage;
        el.duration.value =   syncedItems.duration;
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
        checkInterval: el.duration.value / 4
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
        duration: s.duration
      }, function() {
        el.highUsage.value =  s.highUsage;
        el.duration.value =   s.duration;
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
