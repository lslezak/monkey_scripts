// ==UserScript==
// @name         Bugzilla Trello integration
// @namespace    https://blog.ladslezak.cz/
// @version      0.1.1
// @description  Integrate Bugzilla with Trello
// @author       Ladislav Slezák
// @match        https://bugzilla.suse.com/show_bug.cgi*
// @match        https://bugzilla.suse.com/process_bug.cgi
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @connect      trello.com
// @downloadURL  https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_trello_integration.user.js
// @updateURL    https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_trello_integration.meta.js
// ==/UserScript==


// see the Trello API documentation: https://developers.trello.com/v1.0/reference

(function() {
    'use strict';

    function debug(obj) {
        // to enable logging uncomment this line:
        // console.log(obj);
    }

    // escape special HTML characters
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // abbreviate a SUSE product name
    function abbrev(s) {
        return s
            .replace("openSUSE", "oS")
            .replace("SUSE Linux Enterprise Desktop", "SLED")
            .replace("SUSE Linux Enterprise Server", "SLES")
            .replace("SUSE Container as a Service Platform 1.0", "CaaSP1")
            .replace(/\(.*\)/, "") // remove superfluous abbreviation
            .replace(" SP", "-SP")
            .replace(" Factory", "-TW") // Tumbleweed
            .replace(" ", "");
    }

    // display a loading spinner in the "Trello" field
    function displayTrelloSpinner() {
        document.getElementById("trello_spinner").style.display = "block";
    }

    // display a loading spinner in the "Trello" field
    function hideTrelloSpinner() {
        document.getElementById("trello_spinner").style.display = "none";
    }

    // get list for the new card depending on the product abbreviation
    function listId(product_abbrev) {
        var product_lists = {
            "SLE[SD]15": "5952060e0e9190605c75863e",     // SLE 15
            // "59a3db0f0fac7c99d1808ae9" is "SLE 15 Storage" but we can't autodetect that
            "SLE[SD]12-SP3": "57cfdbcc9ae10f3d1fb996d3", // SLE-12-SP3 Maintenance
            "SLE[SD]12-SP2": "5538994821027776154180eb", // SLE12-SP2 Maintenance
            "SLE[SD]12-SP1": "5502d6719b0d5db70bcf6655", // SLE12-SP1 maintenance
            "SLE[SD]12": "5507f04f2c885ffbdd53208a",     // SLE12-maintenance
            "SLE[SD]11": "5507f140ab44b6bcfcc6c561",     // SLE11-maintenance
            "^oS": "550800984de3079fa9ded12a",           // openSUSE
            "CaaSP1": "5877cf5650f2787cf6eb25a1",        // CaaSP 1.0
        };

        for (var regexp in product_lists) {
            var r = new RegExp(regexp);
            if (r.test(product_abbrev)) return product_lists[regexp];
        }

        // fallback: "5507f28d31c1cfac7a83eb72" = Generic Ideas
        return "5507f28d31c1cfac7a83eb72";
    }

    // IDs of the YaST Trello boards
    function yastBoards() {
        return [
            "5507f013b863aa041618871d", // "Agile YaST Incoming Board"
            "5523b2d3a0838af13fc922e4", // "Agile YaST-Retrospective"
            "5502d5dd8eb45fb4581c1a0f", // "Agile YaST: Team R - The best of the rest"
            "557833ad6be7b9634f089201"  // "Agile YaST: Team S as Storage"
         ];
    }

    // Is the card from an YaST board?
    function isYastBoardCard(card) {
        return yastBoards().indexOf(card.board.id) >= 0;
    }

    // get simple "Px" priority from full string like "P2 - High"
    function prioShort(prio_string) {
        return prio_string.match(/^(P[0-5])/)[1];
    }

    // create label or a new card from the bug properties
    function cardLabel(prod, prio, bug_id, summary) {
        // [<product>] (<priority>) #<bug_id> <summary>
        return "[" + prod +"] (" + prio + ") #" + bug_id + " " + summary;
    }

    // return the initial description for a new card
    function cardDescription(bug_id) {
        return "Bugzilla: [bsc#" + bug_id + "](https://bugzilla.suse.com/show_bug.cgi?id=" + bug_id + ")\n\n" +
            "---\n\n" +
            "## Review\n\n" +
            "- Pull Request: *URL here*";
    }

    // add the created card URL to the bug and submit it
    function submitCardUrl(url) {
        // change the assignee to "yast-internal" only if assigned to "yast2-maintainers"
        var assignee_node = document.getElementById("assigned_to");
        if (assignee_node.value == "yast2-maintainers@suse.de") {
            assignee_node.value = "yast-internal@suse.de";
        }

        // change the status of the "NEW" bug, "NEW" means nobody looked at
        var bug_status = document.getElementById("bug_status");
        if (bug_status.value === "NEW") {
          bug_status.value = "CONFIRMED";
        }

        // add card URL to the "URL" field
        if (document.getElementById("bug_file_loc").value === "") {
          document.getElementById("bug_file_loc").value = url;
        } else {
          // or to a private comment if the field is not empty
          // TODO: read the current value, maybe the user wrote something there...
          document.getElementById("comment").value = "Tracked at Trello: " + url;
          document.getElementById("newcommentprivacy").checked = true;
        }
        // submit the changes
        document.getElementById("changeform").submit();
    }

    // create a new Trello card
    function createCard(card) {
        debug("Creating card: " + card);

        GM_xmlhttpRequest({
            method: "POST",
            responseType: "JSON",
            url: buildTrelloUrl("cards", card),
            onload: function(response) {
                // debug(response);
                var ret = JSON.parse(response.responseText);
                debug(ret);

                if (response.status != 200) {
                    console.error("Error: Creating the card failed!");
                    displayError();
                    return;
                }

                GM_notification("Created a new Trello card", "Trello Integration",
                    "https://a.trellocdn.com/images/services/e1b7406bd79656fdd26ca46dc8963bee/trello.png");

                submitCardUrl(ret.shortUrl);
            }
        });
    }

    // validate the bug state, display a spinner and create a new Trello card
    function addToTrello() {
        // check priority != P5 None, priority is part of the card label
        // make sure there is something meaningful
        var prio = prioShort(document.getElementById("priority").value);
        if (prio === "P5") {
            alert("Error: Priority needs to be set to P1-P4 \nfor creating a Trello card.");
            return;
        }

        // hide the "Add to Trello" button and display a progress
        setTrelloContent("");
        displayTrelloSpinner();

        var bug_id = document.getElementsByName("id")[0].value;
        var card_prod = abbrev(document.getElementById("product").value);
        var summary = document.getElementById("short_desc_nonedit_display").innerText;

        var card = {
          name: cardLabel(card_prod, prio, bug_id, summary),
          desc: cardDescription(bug_id),
          idList: listId(card_prod),
          idLabels: "5507f01351e31d6bed661181", // = "New item; PO, please, have a look"
          pos: "top"
        };

        // create the card
        createCard(card);
    }

    // display generic error message in the "Trello" field
    function displayError() {
        setTrelloContent("Error: Trello connection failed");
    }

    // extract the API key from the https://trello.com/app-key HTML page
    function apiKeyFromHtml(html) {
        // the HTML page contains a #key element with the API key
        // parse the HTML using the native DOMParser object
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var key = doc.getElementById("key");
        return key ? key.value : null;
    }

    // inject the CSS style
    function injectCSS() {
        GM_addStyle(".loader { border: 4px solid #f3f3f3;" +
            "  border-top: 4px solid #3498db;" +
            "  border-radius: 50%;" +
            "  width: 12px; height: 12px;" +
            "  animation: spin 1s linear infinite;" +
            "}" +
            "@keyframes spin {" +
            "  0% { transform: rotate(0deg); }" +
            "  100% { transform: rotate(360deg); }" +
            "}" +
            ".trello_info:not(:first-child) { margin-top: 6px; }" +
            ".trello_box { border-radius: 3px; padding: 4px; display: inline-block; margin-top: 1px; }" +
            ".trello_box:not(:last-child) { margin-right: 3px; }" +
            ".trello_icon { width: 14px; height: 14px; margin: 2px; vertical-align: text-bottom } " +
            ".avatar_icon { width: 25px; height: 25px; margin-bottom: 3px; margin-right: 3px; vertical-align: middle; border-radius: 3px; } " +
            ".trello_card { text-decoration: underline; color: #444; background-color: #e6e6e6; }" +
            ".trello_yast_board { background-color: #e1e3fb; }" +
            ".trello_other_board { background-color: #fde9c5; }" +
            ".trello_card a { text-decoration: underline; color: #444; }" +
            ".trello_card a:hover { color: black; }" +
            ".trello_card a:visited { color: #333; }" +
            ".trello_closed_card { background-color: #BBB; }"
        );
    }

    // add new "Trello" field into the bug report
    function addTrelloField() {
        var url_line = document.getElementById("field_label_bug_file_loc").parentNode;
        var span = document.createElement('tr');
        span.innerHTML = '<th class="field_label"><a title="Trello integration." class="field_help_link">Trello:</a></th>' +
            '<td><div id="trello_spinner" class="loader"></div><div id="bz_trello_area"></div></td>';
        url_line.parentNode.insertBefore(span, url_line);
    }

    // return the bug ID (the number)
    function bugId() {
        return document.getElementsByName("id")[0].value;
    }

    // render a Trello card
    function renderTrelloCard(card) {
        var ret = "<span class=\"trello_box trello_card\"><a href=\"" + escapeHtml(card.shortUrl) +
            "\"><img class=\"trello_icon\" src=\"https://a.trellocdn.com/images/services/e1b7406bd79656fdd26ca46dc8963bee/trello.png\">" +
            escapeHtml(card.name) + "</a></span>";

        var card_location = escapeHtml(card.board.name) + " / " + escapeHtml(card.list.name);

        if (card.closed) {
          ret = ret + "<span class =\"trello_box trello_closed_card\" title='" + card_location + "'>Archived</span>";
        } else {
          ret = ret + "<span class=\"trello_box " + (isYastBoardCard(card) ? "trello_yast_board" : "trello_other_board") +
            "\">" + card_location + "</span>";
        }

        var avatars = card.members.map(function(m) {
            return "<img class=\"avatar_icon\" src=\"https://trello-avatars.s3.amazonaws.com/" +
              escapeHtml(m.avatarHash) + "/30.png\" title=\"" + escapeHtml(m.fullName) + "\">";
        });

        return "<div class='trello_info'>" + ret + "<span>" + avatars.join('') + "</span></div>";
    }

    // render list of Trello cards
    function renderTrelloCards(cards) {
        return cards.map(function(c) {
            return renderTrelloCard(c);
        }).join('');
    }

    function setTrelloContent(content) {
        document.getElementById("bz_trello_area").innerHTML = content;
    }

    function appendTrelloContent(content) {
      var trello_node = document.getElementById("bz_trello_area");
        trello_node.innerHTML = trello_node.innerHTML + content;
    }

    function isEmpty(str) {
        return str === null || str === undefined || str === "";
    }

    function getTrelloApiKey() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://trello.com/app-key",
            onload: function(response) {
                hideTrelloSpinner();
                // debug(response);
                if (response.status == 401) {
                  setTrelloContent("<a href='https://trello.com/login'>Log into Trello</a>");
                } else if (response.status == 200) {
                    var api_key = apiKeyFromHtml(response.responseText);
                    // debug(api_key);
                    if (api_key) {
                        // save the key for later
                        GM_setValue("bugzilla_trello_api_key", api_key);
                        // just reload the page to restart the setup
                        window.location.reload();
                    } else {
                        console.error(response);
                        displayError();
                    }
                } else {
                    console.error(response);
                    displayError();
                }
            }
        });
    }

    function authorizeTrello() {
        setTrelloContent("");
        displayTrelloSpinner();

        // inspired by https://trello.com/1/client.coffee
        var width = 500;
        var height = 765;
        var left = window.screenX + (window.innerWidth - width) / 2;
        var top = window.screenY + (window.innerHeight - height) / 2;

        var url = buildTrelloUrl("authorize", {
          name: "Bugzilla Integration",
          expiration: "never",
          response_type: "token",
          scope: "read,write",
          callback_method: "postMessage",
          return_url: window.location.origin
        });

        var properties = "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top;

        var authWindow = window.open(url, "trello", properties);
        debug(authWindow);

        var receiveMessage = function(event) {
            debug(event);
            // ignore the messages coming from other windows
            if (event.source !== authWindow || event.origin !== "https://trello.com") {
                return;
            }

            authWindow.close();

            if ((event.data !== null) && /[0-9a-f]{64}/.test(event.data)) {
                var token = event.data;
                debug(token);
                // save the token for later
                GM_setValue("bugzilla_trello_token", token);
            }

            window.removeEventListener("message", receiveMessage, false);
            // just reload the page to restart after the setup
            window.location.reload();
        };
        window.addEventListener("message", receiveMessage, false);

        // skip the default onclick action
        return false;
    }

    function displayFoundCards(cards) {
        if (cards.length > 0) {
          appendTrelloContent(renderTrelloCards(cards));
        }
    }

    // display "Add to Trello" button if not already displayed
    function displayAddButton() {
      if (!document.getElementById("add_to_trello_btn")) {
        appendTrelloContent("<div class='trello_info'><input type=\"button\" value=\"Add to Trello and Save Changes\" " +
          "id=\"add_to_trello_btn\" style=''></div>");
        document.getElementById("add_to_trello_btn").onclick = addToTrello;
      }
    }

    function displayEmptyResult() {
        var status = document.getElementById("bug_status").value;
        if (status === "NEW" || status === "CONFIRMED" || status === "IN_PROGRESS" || status === "REOPENED") {
            displayAddButton();
        } else {
            setTrelloContent("<em>Bug not found in Trello.</em>");
        }
    }

    // scan the page for Trello card links and return the found card IDs
    function scanTrelloLinks() {
      var re = /https:\/\/trello.com\/c\/([0-9a-zA-Z]+)/g;
      var cards = [];

      document.querySelectorAll('pre.bz_comment_text').forEach(function(comment) {
        var text = comment.innerText;

        var state;
        do {
            state = re.exec(text);
            if (state) {
                cards.push(state[1]);
            }
        } while (state);
      });

      var bug_url = document.getElementById("bug_file_loc").value;
      if (bug_url && bug_url.startsWith("https://trello.com/c/")) {
          cards.push(bug_url.match(/^https:\/\/trello.com\/c\/([^\/]+)/)[1]);
      }

      // remove duplicates
      cards = cards.filter(
        function (value, index, self) {
          return self.indexOf(value) === index;
      });


      return cards;
    }

    function trelloKey() {
      return GM_getValue("bugzilla_trello_api_key");
    }

    function trelloToken() {
      return GM_getValue("bugzilla_trello_token");
    }

    // build escaped URL query part
    function queryString(obj) {
      var parts = [];
      for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
              parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
          }
      }
      return parts.join("&");
    }

    // build a Trello API URL including key and token
    function buildTrelloUrl(path, params = {}) {
      if (trelloKey()) {
        params.key = trelloKey();
      }

      if (trelloToken()) {
        params.token = trelloToken();
      }

      return "https://api.trello.com/1/"+ path + "?" +
        queryString(params);
    }

    // debugging helper to send requests to Trello
    function trelloDebugQuery(path, params = {}) {
      debug(buildTrelloUrl(path, params));
      GM_xmlhttpRequest({
        method: "GET",
        responseType: "JSON",
        url: buildTrelloUrl(path, params),
        onload: function(response) {
          debug(response);
          var ret = JSON.parse(response.responseText);
          debug(ret);
        }
      });
    }

    function makeTrelloRequest(path, params, method = "GET") {
      return new Promise(function (resolve, reject) {
        GM_xmlhttpRequest({
          method: method,
          responseType: "JSON",
          url: buildTrelloUrl(path, params),
          onload: function(response) {
            debug(response);
            // TODO: error handling
            resolve(JSON.parse(response.responseText));
          },
          onerror: function() {
            reject();
          },
          ontimeout: function() {
            reject();
          }
        });
      });
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    if (!document.getElementById("bug_file_loc")) {
        console.warn("Skipping the Trello integration, not logged in?");
        return;
    }

    // add the new "Trello" field and initialize it with a spinner
    injectCSS();
    addTrelloField();

    // simple configuration for now, maybe use https://github.com/sizzlemctwizzle/GM_config later
    if (isEmpty(trelloKey())) {
        getTrelloApiKey();
        // finish the script, we do not have the API key and cannot continue,
        // it is being loaded in the background
        return;
    }

    if (isEmpty(trelloToken())) {
        hideTrelloSpinner();
        setTrelloContent("<a id='trello_authorization' href='#'>Authorize Trello</a>");
        document.getElementById("trello_authorization").onclick = authorizeTrello;

        // finish the script, we do no have the token and cannot continue,
        // the authorization runs after clicking the link
        return;
    }


    // some dubugging hints to get the internal IDs:
    // to get the board IDs:
    // trelloDebugQuery("members/me/boards");
    // to get the list IDs:
    // trelloDebugQuery("boards/5507f013b863aa041618871d/lists");
    // to get the label IDs:
    // trelloDebugQuery("boards/5507f013b863aa041618871d/labels");

    // Always search for the bug, add the "URL" card if it is missing (the bug
    // might be mentioned in several cards) and the URL field might contain only
    // one card reference.
    // On the other hand the "URL" field might refer to a card which does not contain
    // the bug number so using both approaches together is probably the best idea.
    // If the "URL" card was already found by the search then it does not need to
    // loaded from Trello so there is no overhead.

    displayTrelloSpinner();

    GM_xmlhttpRequest({
        method: "GET",
        responseType: "JSON",
        url: buildTrelloUrl("search", {
          query: bugId(),
          card_fields: "name,shortUrl,closed",
          card_members: true,
          card_list: true,
          idBoards: yastBoards().join(","),
          modelTypes: "cards",
          card_board: true,
          board_fields: "name"
        }),
        onload: function(response) {
            // debug(response);
            var ret = JSON.parse(response.responseText);
            debug(ret);

            // filter the card name matches only, Trello searches in descriptions as well
            var matching_cards = ret.cards.filter(function(card) {
                var r = new RegExp("\\b" + bugId() + "\\b");
                return r.test(card.name);
            });
            debug(matching_cards);

            // scan the bug report for the Trello cards
            var found_cards = scanTrelloLinks();

            // remove ids for already found cards
            found_cards = found_cards.filter(function (card_id) {
                return !matching_cards.some(function(card) {
                    return card.shortUrl.match(/^https:\/\/trello.com\/c\/([^\/]+)/)[1] == card_id;
                });
            });

            if (matching_cards.length === 0 && found_cards.length === 0) {
              displayEmptyResult();
            } else {
              displayFoundCards(matching_cards);
            }

            var promises = found_cards.map(function (card_id) {
              return makeTrelloRequest("cards/" + card_id, {
                  fields: "name,shortUrl,closed",
                  members: true,
                  list: true,
                  board: true,
                  board_fields: "name"
              });
            });

            // wait until all asynchronous downloads are finished
            Promise.all(promises).then(function(cards) {
              debug(cards);

              displayFoundCards(cards);
              hideTrelloSpinner();

              // force displaying the "Add to Trello" button
              if (window.location.search.indexOf("force_trello_add") >= 0) {
                displayAddButton();
              }
            }, function(err) {
              hideTrelloSpinner();
              displayError();
              console.error("Error");
            });

        }
    });

})();
