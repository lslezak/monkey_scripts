// ==UserScript==
// @name         Highlight Your Bugzilla Comments
// @namespace    https://blog.ladslezak.cz/
// @version      0.1
// @description  Make your comments better visible in Bugzilla
// @author       Ladislav Slezák
// @match        https://bugzilla.suse.com/show_bug.cgi?id=*
// @match        https://bugzilla.novell.com/show_bug.cgi?id=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // is the user logged in?
    var login = document.querySelectorAll('li.dropdown > span.anchor');
    if (login.length > 0)
    {
        // get the user's email
        var email = login[0].innerHTML;
        // console.log(email);
        document.querySelectorAll('div.bz_comment').forEach(function(comment) {
            // check if the comment author email is the same as the logged user
            if (comment.querySelectorAll('a.email')[0].getAttribute("href") == ("mailto:" + email)){
                // TODO: the private comments should probably have a different color...
                comment.style.backgroundColor = "rgb(216, 216, 255)";
                comment.style.padding = "8px";
            }
        });
    }
})();
