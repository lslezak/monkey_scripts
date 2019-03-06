// ==UserScript==
// @name         Auto-redirect to the SUSE Bugzilla
// @namespace    https://blog.ladslezak.cz/
// @version      0.1.2
// @description  Use one SUSE bugzilla consitently, automatically redirect from other domains
// @author       Ladislav Slezák
// @run-at       document-start
// @match        https://bugzilla.novell.com/*
// @match        https://bugzilla.opensuse.org/*
// @match        https://bugzilla.netiq.com/*
// @grant        none
// @downloadURL  https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_redirect.user.js
// @updateURL    https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_redirect.user.js
// ==/UserScript==

(function() {
    'use strict';

    var url = new URL(location.href);
    url.hostname = "bugzilla.suse.com";

    document.write("<br><h2>Redirecting to the SUSE bugzilla...</h2><br><p>" + url + "</p>");

    window.location.replace(url);
})();
