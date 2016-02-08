import Ember from 'ember';
import i18n from '../../utils/i18n';
import app_state from '../../utils/app_state';
import utterance from '../../utils/utterance';
import capabilities from '../../utils/capabilities';
import modal from '../../utils/modal';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  buttonSpacingList: [
    {name: i18n.t('extra_small', "Extra-Small (5px)"), id: "extra-small"},
    {name: i18n.t('small', "Small (10px)"), id: "small"},
    {name: i18n.t('medium', "Medium (15px)"), id: "medium"},
    {name: i18n.t('large', "Large (25px)"), id: "large"},
    {name: i18n.t('huge', "Huge (50px)"), id: "huge"}
  ],
  buttonBorderList: [
    {name: i18n.t('none', "None"), id: "none"},
    {name: i18n.t('small', "Small (1px)"), id: "small"},
    {name: i18n.t('medium', "Medium (2px)"), id: "medium"},
    {name: i18n.t('thick', "Thick (5px)"), id: "large"},
    {name: i18n.t('huge', "Huge (10px)"), id: "huge"}
  ],
  buttonTextList: [
    {name: i18n.t('none', "None"), id: "none"},
    {name: i18n.t('small', "Small (14px)"), id: "small"},
    {name: i18n.t('medium', "Medium (18px)"), id: "medium"},
    {name: i18n.t('large', "Large (22px)"), id: "large"},
    {name: i18n.t('huge', "Huge (35px)"), id: "huge"},
    {name: i18n.t('text_only', "Text Only (No Images)"), id: "text_only"}
  ],
  buttonStyleList: [
    {name: i18n.t('default_font', "Default Font"), id: "default"},
    {name: i18n.t('default_font_caps', "Default Font, All Uppercase"), id: "default_caps"},
    {name: i18n.t('default_font_small', "Default Font, All Lowercase"), id: "default_small"},
    // Don't hate on me, Comic Sans is not my fave, but it's the only web safe font I could find
    // that had the handwritten "a", which could be important for emergent readers.
    {name: i18n.t('comic_sans', "Comic Sans"), id: "comic_sans"},
    {name: i18n.t('comic_sans_caps', "Comic Sans, All Uppercase"), id: "comic_sans_caps"},
    {name: i18n.t('comic_sans_small', "Comic Sans, All Lowercase"), id: "comic_sans_small"},
  ],
  activationLocationList: [
    {name: i18n.t('pointer_release', "Where I Release My Pointer"), id: "end"},
    {name: i18n.t('pointer_start', "Where I First Press"), id: "start"}
  ],
  buttonSpaceList: [
    {name: i18n.t('dont_stretch', "Don't Stretch Buttons"), id: "none"},
    {name: i18n.t('prefer_tall', "Stretch Buttons, Taller First"), id: "prefer_tall"},
    {name: i18n.t('prefer_tall', "Stretch Buttons, Wider First"), id: "prefer_wide"},
  ],
  buttonBackgroundList: [
    {name: i18n.t('white', "White"), id: "white"},
    {name: i18n.t('black', "Black"), id: "black"}
  ],
  dashboardViewList: [
    {name: i18n.t('communicator', "Communicator"), id: 'communicator'},
    {name: i18n.t('supporter', "Therapist/Parent/Supporter"), id: 'supporter'}
  ],
  scanningModeList: [
    {name: i18n.t('row_based', "Row-Based Scanning"), id: "row"},
    {name: i18n.t('column_based', "Column-Based Scanning"), id: "column"},
    {name: i18n.t('region_based', "Region-Based Scanning"), id: "region"}
  ],
  scan_pseudo_options: [
    {name: i18n.t('select', "Select"), id: "select"},
    {name: i18n.t('next', "Next"), id: "next"}
  ],
  vocalizationHeightList: [
    {name: i18n.t('tiny', "Tiny (50px)"), id: "tiny"},
    {name: i18n.t('small', "Small (70px)"), id: "small"},
    {name: i18n.t('medium', "Medium (100px)"), id: "medium"},
    {name: i18n.t('large', "Large (150px)"), id: "large"},
    {name: i18n.t('huge', "Huge (200px)"), id: "huge"}
  ],
  title: function() {
    return "Preferences for " + this.get('model.user_name');
  }.property('model.user_name'),
  check_voices_available: function() {
    var _this = this;
    if(capabilities.installed_app) {
      capabilities.tts.status().then(function() {
        _this.set('more_voices_available', true);
      }, function() {
        _this.set('more_voices_available', false);
      });
    } else {
      _this.set('more_voices_available', false);
    }
  },
  non_communicator: function() {
    return this.get('model.preferences.role') != 'communicator';
  }.property('model.preferences.role'),
  region_scanning: function() {
    return this.get('model.preferences.device.scanning_mode') == 'region';
  }.property('model.preferences.device.scanning_mode'),
  select_keycode_string: function() {
    if(this.get('model.preferences.device.scanning_select_keycode')) {
      return (i18n.key_string(this.get('model.preferences.device.scanning_select_keycode')) || 'unknown') + ' key';
    } else {
      return "";
    }
  }.property('model.preferences.device.scanning_select_keycode'),
  next_keycode_string: function() {
    if(this.get('model.preferences.device.scanning_next_keycode')) {
      return (i18n.key_string(this.get('model.preferences.device.scanning_next_keycode')) || 'unknown') + ' key';
    } else {
      return "";
    }
  }.property('model.preferences.device.scanning_next_keycode'),
  fullscreen_capable: function() {
    return capabilities.fullscreen_capable();
  }.property(),
  wakelock_capable: function() {
    return capabilities.wakelock_capable();
  }.property(),
  user_voice_list: function() {
    var list = this.get('application.voiceList');
    var result = [];
    var premium_voice_ids = (this.get('model.premium_voices.claimed') || []).map(function(id) { return "extra:" + id; });
    list.forEach(function(voice) {
      if(voice.voiceURI && voice.voiceURI.match(/^extra/)) {
        if(premium_voice_ids.indexOf(voice.voiceURI) >= 0) {
          result.push(voice);
        }
      } else {
        result.push(voice);
      }
    });
    return result;
  }.property('application.voiceList', 'model.premium_voices.claimed'),
  active_sidebar_options: function() {
    var res = this.get('model.preferences.sidebar_boards');
    if(!res || res.length === 0) {
     res = [].concat(window.user_preferences.any_user.default_sidebar_boards);
    }
    res.forEach(function(b, idx) { b.idx = idx; });
    return res;
  }.property('model.preferences.sidebar_boards'),
  disabled_sidebar_options: function() {
    var defaults = window.user_preferences.any_user.default_sidebar_boards;
    if(this.get('include_prior_sidebar_buttons')) {
      (this.get('model.preferences.prior_sidebar_boards') || []).forEach(function(b) {
        if(!defaults.find(function(o) { return (o.key && o.key == b.key) || (o.alert && b.alert); })) {
          defaults.push(b);
        }
      });
    }
    var active = this.get('active_sidebar_options');
    var res = [];
    defaults.forEach(function(d) {
      if(!active.find(function(o) { return (o.key && o.key == d.key) || (o.alert && d.alert); })) {
        res.push(d);
      }
    });
    return res;
  }.property('model.preferences.sidebar_boards', 'include_prior_sidebar_buttons', 'model.preferences.prior_sidebar_boards'),
  disabled_sidebar_options_or_prior_sidebar_boards: function() {
    return (this.get('disabled_sidebar_options') || []).length > 0 || (this.get('model.preferences.prior_sidebar_boards') || []).length > 0;
  }.property('disabled_sidebar_options', 'model.preferences.prior_sidebar_boards'),
  needs: 'application',
  actions: {
    plus_minus: function(direction, attribute) {
      var default_value = 1.0;
      var step = 0.1;
      var max = 10;
      var min = 0.1;
      var empty_on_default = false;
      if(attribute == 'model.preferences.device.voice.volume') {
        max = 2.0;
      } else if(attribute == 'model.preferences.device.voice.pitch') {
        max = 2.0;
      } else if(attribute == 'model.preferences.activation_cutoff') {
        min = 0;
        max = 5000;
        step = 100;
        default_value = 0;
        empty_on_default = true;
      } else if(attribute == 'model.preferences.activation_minimum') {
        min = 0;
        max = 5000;
        step = 100;
        default_value = 0;
        empty_on_default = true;
      } else if(attribute == 'model.preferences.board_jump_delay') {
        min = 100;
        max = 5000;
        step = 100;
        default_value = 500;
      } else if(attribute == 'model.preferences.device.scanning_interval') {
        min = 0;
        max = 5000;
        step = 100;
        default_value = 1000;
      } else if(attribute == 'model.preferences.device.scanning_region_columns' || attribute == 'model.preferences.device.scanning_region_rows') {
        min = 1;
        max = 10;
        step = 1;
      }
      var value = parseFloat(this.get(attribute), 10) || default_value;
      if(direction == 'minus') {
        value = value - step;
      } else {
        value = value + step;
      }
      value = Math.round(Math.min(Math.max(min, value), max) * 100) / 100;
      if(value == default_value && empty_on_default) {
        value = "";
      }
      this.set(attribute, value);
    },
    savePreferences: function() {
      // TODO: add a "save pending..." status somewhere
      // TODO: this same code is in utterance.js...
      var pitch = parseFloat(this.get('model.preferences.device.voice.pitch'));
      if(isNaN(pitch)) { pitch = 1.0; }
      var volume = parseFloat(this.get('model.preferences.device.voice.volume'));
      if(isNaN(volume)) { volume = 1.0; }
      this.set('model.preferences.device.voice.pitch', pitch);
      this.set('model.preferences.device.voice.volume', volume);

      var user = this.get('model');
      user.set('preferences.progress.preferences_edited', true);
      var _this = this;
      user.save().then(function(user) {
        if(user.get('id') == app_state.get('currentUser.id')) {
          app_state.set('currentUser', user);
        }
        _this.transitionToRoute('user', user.get('user_name'));
      }, function() { });
    },
    cancelSave: function() {
      this.set('advanced', false);
      var user = this.get('model');
      user.rollbackAttributes();
      this.transitionToRoute('user', user.get('user_name'));
    },
    sidebar_button_settings: function(button) {
      modal.open('sidebar-button-settings', {button: button});
    },
    include_prior_sidebar_buttons: function() {
      this.set('include_prior_sidebar_buttons', true);
    },
    move_sidebar_button: function(button, direction) {
      var active = this.get('active_sidebar_options');
      var disabled = this.get('disabled_sidebar_options');
      if(direction == 'up') {
        var pre = active.slice(0, Math.max(0, button.idx - 1));
        var swap = [button];
        if(active[button.idx - 1]) {
          swap.push(active[button.idx - 1]);
        }
        var post = active.slice(button.idx + 1);
        this.set('model.preferences.sidebar_boards', pre.concat(swap, post));
      } else if(direction == 'down') {
        var pre = active.slice(0, Math.max(0, button.idx));
        var swap = [button];
        if(active[button.idx + 1]) {
          swap.unshift(active[button.idx + 1]);
        }
        var post = active.slice(button.idx + 2);
        this.set('model.preferences.sidebar_boards', pre.concat(swap, post));
      } else if(direction == 'delete') {
        var pre = active.slice(0, button.idx);
        var post = active.slice(button.idx + 1);
        var prior = [].concat(this.get('model.preferences.prior_sidebar_boards') || []);
        prior.push(button);
        prior = prior.uniq(function(o) { return o.alert ? 'alert' : o.key; });
        this.set('model.preferences.prior_sidebar_boards', prior);
        this.set('model.preferences.sidebar_boards', pre.concat(post));
      } else if(direction == 'restore') {
        this.set('model.preferences.sidebar_boards', active.concat([button]));
      }
    },
    premium_voices: function() {
      var _this = this;
      app_state.check_for_full_premium(this.get('model'), 'premium_voices').then(function() {
        modal.open('premium-voices', {user: _this.get('model')});
      });
    },
    test_voice: function() {
      utterance.test_voice(this.get('model.preferences.device.voice.voice_uri'), this.get('model.preferences.device.voice.rate'), this.get('model.preferences.device.voice.pitch'), this.get('model.preferences.device.voice.volume'));
    },
    delete_logs: function() {
      modal.open('confirm-delete-logs', {user: this.get('model')});
    },
    toggle_advanced: function() {
      this.set('advanced', !this.get('advanced'));
    }
  }
});