// ==UserScript==
// @name         Relative time in bugzilla comments
// @namespace    https://blog.ladslezak.cz/
// @version      0.1.3
// @description  Display relative time in bugzilla comment time stamps
// @author       Ladislav Slezák
// @match        https://bugzilla.suse.com/show_bug.cgi?id=*
// @match        https://bugzilla.suse.com/process_bug.cgi
// @grant        none
// @downloadURL  https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_relative_time.user.js
// @updateURL    https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_relative_time.user.js
// ==/UserScript==

// Note: if you do not use the "bugzilla_redirect.user.js" script
// then add the @match key also with the https://bugzilla.novell.com and
// https://bugzilla.opensuse.org variants.


// see https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time-eg-2-seconds-ago-one-week-ago-etc-best
var TimeAgo = (function() {
    var self = {};

    // Public Methods
    self.locales = {
        prefix: '',
        sufix:  'ago',

        seconds: 'less than a minute',
        minute:  'about a minute',
        minutes: '%d minutes',
        hour:    'about an hour',
        hours:   'about %d hours',
        day:     'a day',
        days:    '%d days',
        month:   'about a month',
        months:  '%d months',
        year:    'about a year',
        years:   '%d years'
    };

    self.inWords = function(timeAgo) {
        var seconds = Math.floor((new Date() - parseInt(timeAgo)) / 1000),
            separator = this.locales.separator || ' ',
            words = this.locales.prefix + separator,
            interval = 0,
            intervals = {
                year:   seconds / 31536000,
                month:  seconds / 2592000,
                day:    seconds / 86400,
                hour:   seconds / 3600,
                minute: seconds / 60
            };

        var distance = this.locales.seconds;

        for (var key in intervals) {
            interval = Math.floor(intervals[key]);

            if (interval > 1) {
                distance = this.locales[key + 's'];
                break;
            } else if (interval === 1) {
                distance = this.locales[key];
                break;
            }
        }

        distance = distance.replace(/%d/i, interval);
        words += distance + separator + this.locales.sufix;

        return words.trim();
    };

    return self;
}());

(function() {
    'use strict';

    // define the CSS style for the relative time
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.bz_comment_time .rel_time {color: gray; margin-left: 0.5em}';
    document.getElementsByTagName('head')[0].appendChild(style);

    document.querySelectorAll('span.bz_comment_time').forEach(function(stamp) {
        var text = stamp.innerText.trim();
        // console.log(text);

        // Date.parse can handle only UTC, consider the other TZs as local
        if (!text.endsWith(" UTC"))
        {
            text = text.replace(/ \w+$/, '');
            // console.log(text);
        }

        var rel_time = TimeAgo.inWords(Date.parse(text));
        // console.log(rel_time);

        stamp.innerHTML = text + " <span class='rel_time'>(" + rel_time + ")</span>";
    });
})();
