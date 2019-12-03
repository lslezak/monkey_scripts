// ==UserScript==
// @name         Enable/Disable all master Jenkins jobs
// @namespace    https://blog.ladslezak.cz/
// @version      0.1.0
// @description  Globally enable or disable YaST autosubmission for the master branch
// @author       Ladislav Slezák
// @match        https://ci.suse.de/view/YaST/
// @match        https://ci.suse.de/view/YaST/?auto_refresh=*
// @match        https://ci.opensuse.org/view/Yast/
// @match        https://ci.opensuse.org/view/Yast/?auto_refresh=*
// @grant        none
// @downloadURL  https://github.com/lslezak/monkey_scripts/blob/master/jenkins_change_all_jobs.user.js
// @updateURL    https://github.com/lslezak/monkey_scripts/blob/master/jenkins_change_all_jobs.user.js
// ==/UserScript==


(function() {
    'use strict';

    // the branch name
    var branch_name = "master";

    // is a user logged in?
    function user_logged()
    {
        // is the "log in" link displayed?
        var login_link_text = document.querySelectorAll('.login a b')[0].innerText;
        return login_link_text != "log in";
    }

    function autorefresh_enabled()
    {
        // is the "log in" link displayed?
        var autorefresh_link_text = document.querySelectorAll('#right-top-nav a')[0].innerText;
        return autorefresh_link_text == "DISABLE AUTO REFRESH";
    }

    // find the jobs in the table matching the requested branch and status
    function find_jobs(enabled)
    {
        var jobs = [];
        var table = document.getElementById("projectstatus");
        var regexp = new RegExp("^yast-.*-" + branch_name + "$");

        // start from index 1 to skip the table header
        for (var i = 1, row; row = table.rows[i]; i++) {
            // the job name is in the 3rd column
            var cell = row.cells[2];
            // get the job name from the URL link
            var a = cell.getElementsByTagName("a")[0]
            var list = a.href.split('/');
            list.pop();
            var job = list.pop();

            // skip the CI docker jobs, they should stay untouched (disabled)
            if (job.match(regexp) && !job.match(/^yast-ci-/))
            {
                var status_img = row.cells[0].getElementsByTagName("img")[0];
                if (enabled != status_img.classList.contains("icon-disabled"))
                {
                    jobs.push(job);
                }
            }
        }

        console.log(jobs);
        return jobs;
    }

    // convert a boolean to "enable"/"disable" text
    function enable_text(enable)
    {
        return enable ? "enable" : "disable";
    }

    // display a message below the injected buttons
    function log_message(msg, color)
    {
        var log = document.getElementById("mass-change-log");
        var log_line = document.createElement("div");
        log_line.style.color = color;
        log_line.innerHTML = msg;
        log.appendChild(log_line)
    }

    // create a Promise which changes the job status on the server
    function create_change_promise(name, enable, success)
    {
        return new Promise(
            function (resolve, reject) {
                console.log(enable ? "Enabling: " : "Disabling: ", name);

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/job/" + name + "/" + enable_text(enable), true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.onreadystatechange = function()
                {
                    if (this.readyState === XMLHttpRequest.DONE)
                    {
                        var log = document.getElementById("mass-change-log");
                        var log_line = document.createElement("div");
                        log.appendChild(log_line)

                        if (this.status === 200)
                        {
                            log_message("✔ Job <a href='/job/" + name + "' target='_blank'>" + name + "</a> " + enable_text(enable) + "d", "green");
                            resolve(success);
                        }
                        else
                        {
                            log_message("✘ Error: Cannot " + enable_text(enable) + " job <a href='/job/" + name + "' target='_blank'>" + name + "</a>", "red");
                            console.log("XHR response error code: ", this.status);
                            // call resolve() also on a failure, reject() would stop immediately
                            // skipping the following jobs - try to change as much as possible
                            resolve(false);
                        }
                    }
                }

                // send the CSRF token in the request body
                // the "crumb" object is defined by the Jenkins page itself
                xhr.send("Jenkins-Crumb=" + crumb.value);
            }
        );
    }

    // this is called after pressing a button, change the state of all jobs
    function change_jobs(enable)
    {
        var jobs = find_jobs(!enable);
        // nothing to do
        if (jobs.length == 0)
        {
            log_message("All jobs are already " + enable_text(enable) + "d.", "black");
            return;
        }

        // check if the user is logged in
        if (!user_logged())
        {
            console.log("User NOT logged in!");
            log_message("You need to be logged in to change the jobs. See " +
                        "<a href='https://wiki.suse.net/index.php/YaST/jenkins' target='_blank'>" +
                        "this page</a> for details.", "red");
            return;
        }

        if (autorefresh_enabled())
        {
            console.log("Autorefresh enabled!");
            log_message("The page auto refresh needs to be disabled to properly change all jobs. " +
                        "<a href='?auto_refresh=false'>Disable autorefresh</a>", "red");
            return;
        }

        // using Array.reduce and Promise.then we can serialize the asynchronous
        // AJAX requests, otherwise the browser would send all (100+) requests at once
        // and we could not display any progress
        var result = jobs.reduce((acc, job) => {
            return acc.then(value => {
                return create_change_promise(job, enable, value);
            });
        }, Promise.resolve(true));

        // extra code started after resolving all Promises
        result.then(value => {
            console.log("Overall success: ", value);

            // on a failure keep the current page to see the errors,
            // reload only on success
            if (value)
            {
                log_message("Finished, reloading the page...", "black");
                // 1s delay
                setTimeout(() => { window.location.reload(true) } , 1000);
            }
        });
    }

    // create a DOM button object
    function button(label, enable)
    {
        var button = document.createElement("button");
        button.type = "button";
        button.style.cssText = "float:right; margin-left:10px";
        button.innerText = label;
        button.onclick = function() { change_jobs(enable) };

        return button;
    }

    // inject the button widgets into the page
    function add_widgets()
    {
        // create the logging area (for progress, errors, etc...)
        var log = document.createElement("div");
        log.style.cssText = "clear:both";
        log.id = "mass-change-log";

        var table = document.getElementById("projectstatus");
        table.parentNode.prepend(log);
        table.parentNode.prepend(button("Enable all " + branch_name + " jobs", true));
        table.parentNode.prepend(button("Disable all " + branch_name + " jobs", false));
    }

    add_widgets();
})();
