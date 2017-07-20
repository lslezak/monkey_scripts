// ==UserScript==
// @name         Highlight Your Bugzilla Comments
// @namespace    https://blog.ladslezak.cz/
// @version      0.1.2
// @description  Make your comments better visible in Bugzilla
// @author       Ladislav Slezák
// @match        https://bugzilla.suse.com/show_bug.cgi?id=*
// @grant        none
// @downloadURL  https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_my_comments.user.js
// @updateURL    https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_my_comments.user.js
// ==/UserScript==

// Note: if you do not use the "bugzilla_redirect.user.js" script
// then add the @match key also with the https://bugzilla.novell.com and
// https://bugzilla.opensuse.org variants.

(function() {
    'use strict';
    // is a user logged in?
    var login = document.querySelectorAll('li.dropdown > span.anchor');
    if (login.length > 0)
    {
        // get the user's email
        var email = login[0].innerHTML;
        // console.log(email);
        document.querySelectorAll('div.bz_comment').forEach(function(comment) {
            // check if the comment author email is the same as the logged user
            if (comment.querySelectorAll('a.email')[0].getAttribute("href") == ("mailto:" + email)){
                // different color for the private comments
                var priv = comment.querySelectorAll('div.bz_private_checkbox > input[type="checkbox"]')[0].checked;
                comment.style.backgroundColor = priv ? "rgb(216, 216, 255)" : "rgb(251, 206, 148)";
                comment.style.padding = "8px";
            }
        });
    }
})();
