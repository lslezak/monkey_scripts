// ==UserScript==
// @name         Report a new bug easily
// @namespace    https://blog.ladslezak.cz/
// @version      0.0.1
// @description  Bug reporting made easy
// @author       Ladislav Slezák
// @match        https://bugzilla.suse.com/*
// @grant        none
// @downloadURL  https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_new_bug.user.js
// @updateURL    https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_new_bug.user.js
// ==/UserScript==

(function() {
  'use strict';

  if (window.location.href == "https://bugzilla.suse.com/enter_bug.cgi?product=SUSE%20Linux%20Enterprise%20Server%2015&prompt=1") {
    document.getElementById("component").value = "YaST2";

    var label = prompt("Enter the bug summary:");
    if (label !== null) {
      document.getElementById("short_desc").value = label;
      var descr = prompt("Enter the bug description:");
      if (descr !== null) {
        document.getElementById("comment").value = descr;
        document.getElementById("Create").submit();
      }
    }
  } else {
    // TODO: inject the add link into the menu
  }
})();
