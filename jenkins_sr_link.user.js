// ==UserScript==
// @name         Link Created SR
// @namespace    https://blog.ladslezak.cz/
// @version      0.1
// @description  Make the created OBS submit requests a clickable link at the Jenkins log
// @author       Ladislav Slezák
// @match        https://ci.suse.de/*/console
// @match        https://ci.opensuse.org/*/console
// @grant        none
// @downloadURL  
// ==/UserScript==

(function() {
    'use strict';
    var node = document.querySelectorAll('pre.console-output')[0];
    var api = node.innerText.match(/osc -A '([^']*)'/)[1];
    var link_host = (api == "https://api.suse.de/") ? "build.suse.de" : "build.opensuse.org";
    var match = node.innerText.match(/created request id ([0-9]+)/);
    console.log(match);
    var url = "https://" + link_host + "/request/show/" + match[1];
    console.log(url);
    node.innerHTML = node.innerHTML.replace(match[0], "<a title='" + url + "' href='" + url + "' target='_blank'>" + match[0] + "</a>");
})();
