// ==UserScript==
// @name         Better Aging in Trello
// @namespace    https://blog.ladslezak.cz/
// @version      0.2.1
// @description  Display aging border in Trello
// @author       Ladislav Slezák
// @match        https://trello.com/*
// @grant        GM_addStyle
// ==/UserScript==

// Applied only to the YaST board, to use it elsewhere
// edit the regexp and change which columns should be affected
// (or remove the "nth-child" selector to apply everywhere).

// var trello_board_regexp = /^https:\/\/trello.com\/b\/<your_board_id>\//;

// apply only in the matching board
var trello_board_regexp = new RegExp(window.atob("Xmh0dHBzOi8vdHJlbGxvLmNvbS9iL2pxNm5vbjE2Lw=="));
// display the aging style in these columns (index starts from 1!)
var trello_aging_columns = [ 1, 2, 3, 4];

(function() {
    'use strict';

    function inject_css() {
        // apply the style only on the specified columns
        trello_aging_columns.forEach(function (column) {
            // style only the two highest aging levels (2 and 3)
            GM_addStyle('.list-wrapper:nth-child(' + column + ') .aging-level-2.list-card { border-left: solid 6px #c1c1c1; }');
            GM_addStyle('.list-wrapper:nth-child(' + column + ') .aging-level-3.list-card { border-left: solid 6px #939393; }');
        });

        // reset the original Trello styling for all aging levels
        [ 0, 1, 2, 3, 4].forEach(function (age) {
            GM_addStyle('.aging-level-' + age + '.aging-regular { opacity: 1; }');
        });

        console.log("Custom aging style injected");
    };

    // if this is the requested board inject the style directly
    if (window.location.href.match(trello_board_regexp))
    {
        inject_css();
    }
    else
    {
        // The current URL might be a card from the requested board but might be from a different board,
        // we do not know this yet so we cannot inject the CSS now. But we can watch the history stack
        // and check the current URL whenever it is changed.

        // remember the original function
        var original_pushState = history.pushState;

        // monkeypatch the history.pushState()
        history.pushState = function() {
            // call the original pushState() method implementation to handle the call
            var ret = original_pushState.apply(this, arguments);

            // if the changed URL is the requested board then inject the CSS
            if (window.location.href.match(trello_board_regexp))
            {
                inject_css();
                // restore the original function to call this only once
                history.pushState = original_pushState;
            }

            // return the original result
            return ret;
        }
    }

})();
