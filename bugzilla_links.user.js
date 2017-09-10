// ==UserScript==
// @name         Convert Bugzilla/Fate numbers to links
// @namespace    https://blog.ladslezak.cz/
// @version      0.0.1
// @description  Convert bug and feature numbers into clickable links
// @author       Ladislav Slezák
// @match        https://trello.com/*
// @match        https://bugzilla.*/*
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @match        https://fate.suse.com/*
// @match        https://build.suse.de/*
// @match        https://build.opensuse.org/*
// @match        https://travis-ci.org/*
// @match        https://*.opensuse.org/
// @grant        none
// @downloadURL  https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_links.user.js
// @updateURL    https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_links.user.js
// ==/UserScript==


(function() {
    'use strict';

    // based on http://commons.oreilly.com/wiki/index.php/Greasemonkey_Hacks/Linkmania%21

    var t0 = performance.now();

    var bug_ids = [
        {
            regexp: /\bbug\s*#{0,1}\s*([0-9]+)/ig,
            id:     "bug",
            link:   "https://bugzilla.suse.com/show_bug.cgi?id="
        },
        {
            regexp: /\bbsc\s*#{0,1}\s*([0-9]+)/ig,
            id:     "bsc",
            link:   "https://bugzilla.suse.com/show_bug.cgi?id="
        },
        {
            regexp: /\bbnc\s*#{0,1}\s*([0-9]+)/ig,
            id:     "bnc",
            link:   "https://bugzilla.novell.com/show_bug.cgi?id="
        },
        {
            regexp: /\bboo\s*#{0,1}\s*([0-9]+)/ig,
            id:     "boo",
            link:   "https://bugzilla.opensuse.org/show_bug.cgi?id="
        },
        {
            regexp: /\bfate\s*#{0,1}\s*([0-9]+)/ig,
            id:     "fate",
            link:   "https://fate.suse.com/"
        },
        {
            regexp: /\bcve-(\d+-\d+)/ig,
            id:     "cve",
            link:   "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-"
        },
    ];

    bug_ids.forEach(function(bug_id) {
        var snapTextElements = document.evaluate("//text()[not(ancestor::a) " +
                                                 "and not(ancestor::script) and not(ancestor::style) and " +
                                                 "contains(translate(., '" + bug_id.id.toUpperCase() + "', '" + bug_id.id + "'), '" + bug_id.id + "')]",
                                                 document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

        for (var i = snapTextElements.snapshotLength - 1; i >= 0; i--) {
            var elmText = snapTextElements.snapshotItem(i);
            if (bug_id.regexp.test(elmText.nodeValue)) {
                var elmSpan = document.createElement("span");
                var sURLText = elmText.nodeValue;
                elmText.parentNode.replaceChild(elmSpan, elmText);
                bug_id.regexp.lastIndex = 0;
                for (var match = null, lastLastIndex = 0;
                     (match = bug_id.regexp.exec(sURLText)); ) {
                    elmSpan.appendChild(document.createTextNode(
                        sURLText.substring(lastLastIndex, match.index)));
                    var elmLink = document.createElement("a");
                    elmLink.title = bug_id.link + match[1];
                    elmLink.target = "_blank";
                    elmLink.style.textDecoration = 'none';
                    elmLink.style.borderBottom = '1px dashed orange';
                    elmLink.setAttribute("href", bug_id.link + match[1]);
                    elmLink.appendChild(document.createTextNode(match[0]));
                    elmSpan.appendChild(elmLink);
                    lastLastIndex = bug_id.regexp.lastIndex;
                }
                elmSpan.appendChild(document.createTextNode(
                    sURLText.substring(lastLastIndex)));
                elmSpan.normalize();
            }
        }
    });

    var t1 = performance.now();
    console.log("Bugzilla linking took " + (t1 - t0).toFixed(2) + " milliseconds.");

})();

