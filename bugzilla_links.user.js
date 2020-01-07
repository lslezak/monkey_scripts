// ==UserScript==
// @name         Convert Bugzilla/Fate numbers to links
// @namespace    https://blog.ladslezak.cz/
// @version      0.2.0
// @description  Convert bug and feature numbers into clickable links
// @author       Ladislav Slezák
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
// @updateURL    https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_links.meta.js
// ==/UserScript==

function bugIds() {
    'use strict';
    return [
        {
            regexp: /\bbug\s*#{0,1}\s*([0-9]+)/ig,
            id: "bug",
            link: "https://bugzilla.suse.com/show_bug.cgi?id="
        },
        {
            regexp: /\bbsc\s*#{0,1}\s*([0-9]+)/ig,
            id: "bsc",
            link: "https://bugzilla.suse.com/show_bug.cgi?id="
        },
        {
            regexp: /\bbnc\s*#{0,1}\s*([0-9]+)/ig,
            id: "bnc",
            link: "https://bugzilla.novell.com/show_bug.cgi?id="
        },
        {
            regexp: /\bboo\s*#{0,1}\s*([0-9]+)/ig,
            id: "boo",
            link: "https://bugzilla.opensuse.org/show_bug.cgi?id="
        },
        {
            regexp: /\bfate\s*#{0,1}\s*([0-9]+)/ig,
            id: "fate",
            link: "https://fate.suse.com/"
        },
        {
            regexp: /\bcve-(\d+-\d+)/ig,
            id: "cve",
            link: "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-"
        },
    ];
}

// based on http://commons.oreilly.com/wiki/index.php/Greasemonkey_Hacks/Linkmania%21
function make_links() {
    'use strict';
    var t0 = performance.now();

    bugIds().forEach(function(bug_id) {
        // TODO: optimize this, run the XPath query once for all bug IDs
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
}

(function() {
    // do the initial linking after loading the page
    make_links();

    // configuration of the observer
    var config = {
        attributes: false,
        childList: true,
        characterData: true,
        subtree: true
    };

    // timer for delayed update
    var timer;

    // create an observer for watching the changes in the document
    var observer = new MutationObserver(function(mutations) {
        if (timer){
            console.log("Delaying bugzilla linking");
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            // disable the observer, our code will change the DOM as well,
            // that would trigger this function recursively
            observer.disconnect();

            make_links();

            // activate the observer again after all changes are done
            observer.observe(document, config);
        }, 1000);
    });

    // watch for changes in the whole document
    observer.observe(document, config);
})();
