# Monkey Scripts

This is a set of user scripts for the [Tampermonkey](https://tampermonkey.net/)
web browser plugin.

:warning: If you are new to the browser user scripts then read the
[Userscript Beginners HOWTO](https://openuserjs.org/about/Userscript-Beginners-HOWTO)
document first, at least the [What are the risks?](
https://openuserjs.org/about/Userscript-Beginners-HOWTO#what-are-the-risks-)
section.

## Installation

### Browser Plugin

- At first you need to install the plugin into your browser.
  Go to the https://tampermonkey.net page, select your browser and install it.

- To install the user script simply click the :arrow_down: install link below
  and confirm the installation in Tampermonkey.

### Bookmarklet

If you do not want to install any 3rd party plugin into your browser you can use
the [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) feature.

But using bookmarklet has some disadvantages:

- The bookmarklet must be started manually on the page
- The scripts code cannot be updated automatically

#### Installing a Bookmarklet

Bookmarklet is actually a page book mark but contains a Javascript code instead
ofthe usual URL.

To create a bookmarklet create a new book mark in the browser and use
the `javascript:` prefix and paste the `*.user.js` file content. You can skip
the useless comment at the beginning but you have to include also the
`(function() {...})();` wrapper around the code body.

#### Using Bookmarklets

- Open the page for which you want to run the bookmarklet
- Click the bookmarklet book mark to start the script (the browser will
  use the current page, bookmarklets do not change the displayed page as the
  usual bookmarks)
- This works in Chrome and Firefox but might not be supported by all browsers

#### Updating Bookmarklets

As already mentioned, the bookmarklets must be updated manually, simply select
to edit the book mark and replace the old content with the new code.

## Links

- The [Greasemonkey Hacks](
  http://commons.oreilly.com/wiki/index.php/Greasemonkey_Hacks) book contains
  several examples and good tips for writing you own scripts
- https://openuserjs.org/ contains a lot of community scripts (but be careful,
  keep in mind that those scripts have access to your cookies, stored passwords
  etc... so they can easily steal your passwords or other sensitive data!)

## Available User Scripts

*Note: All scripts have been tested in the Chrome browser but should hopefully
work also in the other browsers. But your mileage might vary...*

## Bugzilla

Here are some scripts usable for the (open)SUSE Bugzilla bug tracking system.

#### Bugzilla Redirection

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_redirect.user.js)

The (open)SUSE Bugzilla can be accessed using several URLs:
https://bugzilla.suse.com or https://bugzilla.opensuse.org or
https://bugzilla.novell.com.

Each domain requires separate authentication so it is quite annoying if you
click a link in an email or IRC chat and you get the "Access Denied" pages
then you have to login again although you are already logged in in a different
Bugzilla domain. Also the Novell domain uses a different branding so it would
be nice to always stick with the same UI.

This script always redirects you to the bugzilla.suse.com pages
automatically without need to rewrite the URL manually.

*Note: The script runs as soon as possible, usually the "Access Denied" page is
not displayed and bugzilla.suse.com loading starts immediately.*


#### Relative Time

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_relative_time.user.js)


Bugzilla displays the time stamps for the comments but it is hard to get a quick
overview how long ago the comments were added. To make reading the time stamps
easier you can add relative time like "2 hours ago" or "5 months ago" next to the
standard time stamps.

![monkey_bugzilla_relative_time](
https://user-images.githubusercontent.com/907998/28940631-a92f7934-7895-11e7-949b-f1c64138feee.png)

*Note: The script expects either the local time or the UTC time. If you use
a different time zone then the script will not work correctly. You can change
the displayed time zone in the bugzilla settings.*


#### My Comments

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_my_comments.user.js)

If you are reading a bug with a lot of comments it would nice to spot
your own comments quickly so you can see when and what have you already
commented. This script adds a blue background to all your comments so you
can find them quickly when scrolling up and down. The private comments have
an orange background.

![monkey_bugzilla_my_comments](
https://user-images.githubusercontent.com/907998/28941004-d8b8448c-7896-11e7-9d36-6c1592459eea.png)


#### Converting Bugzilla / FATE Numbers to Links

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_links.user.js)

This scripts converts Bugzilla and FATE numbers into clickable links.
This makes finding the details and the relevant information much easier.

The links created by the script have dashed underline style to make them
different than the usual links.

![screenshot_bugzilla_link](https://user-images.githubusercontent.com/907998/30249300-f4aef6de-9639-11e7-9acc-17ffddfa55f1.png)

#### Trello Integration

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_trello_integration.user.js)

This script integrates the information from Trello cards directly to SUSE Bugzilla.
You can see the relevant Trello cards directly in the bug overview at the top.

The script searches the YaST Trello boards for the current bug number and
additionally scans the bug comments and the URL field for the Trello card links.
It displays the card title, the board and list name and the persons assigned
to that card. (*Hint: see the tooltip if the real name.*)

![bugzilla_trello](https://user-images.githubusercontent.com/907998/30322050-7ce5cf58-97b8-11e7-8ef8-a8b46aaf8639.png)

If there is no card found then a button for creating a new Trello card is displayed.

![bugzilla_trello_add](https://user-images.githubusercontent.com/907998/30322058-84293a16-97b8-11e7-8d3b-5b3fe01edcfa.png)

After clicking it a new card is created, the URL is added to the bug, the assignee
is changed from `yast2-maintainers` to `yast-internal`, the status is changed from
`NEW` to `CONFIRMED` and the bug is submitted.

This basically implementes the functionality of [Martin Vidner's ytrello](
https://github.com/mvidner/ytrello) directly in browser.

Before start using it, the Trello Developer API Key must be already generated.
If you do not have it yet, got to  https://trello.com/app-key and follow the
instructions given there. Otherwise, the `Error: Trello connection failed`
message will be displayed.

In addition, at first, you have to do Trello authorization to get the Trello
application token. There is displayed a link to do that, **just make sure the
popup windows are not blocked by the browser**. You can safely enable them for the
Bugzilla URLs.

---

:warning: This script cannot work as a bookmarklet as it uses some additional
functionality provided by the Tampermonkey plugin. Browsers would normally block
the Trello requests because they break the same origin policy.

---

## Jenkins

#### Create Submit Requests Links

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/jenkins_sr_link.user.js)

Converts the `created request id [number]` text into a clickable link which
points to the created submit request. The script takes the API URL into account
so the link correctly points to the internal or external build service depending
on the API used.

*(Note: it does not work when the text is added to the log when the job is
running, you have to reload the page to restart the script.)*

![jenkins_sr_link](
https://user-images.githubusercontent.com/907998/29870053-f84e1458-8d85-11e7-89ba-68d9ebe671df.png)

#### Enable/Disable YaST Autosubmission

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/jenkins_change_all_jobs.user.js)

This script adds `Enable` and `Disable` buttons into the YaST Jenkins pages. These buttons
globally enable/disable YaST autosubmission to Factory (in the [public Jenkins](
https://ci.opensuse.org/view/Yast/)) or to the latest SLE (in the [internal Jenkins](
https://ci.suse.de/view/YaST/)) by enabling or disabling all YaST jobs for the
`master` Git branch.

You need to be logged in to change the job statuses, see [this internal wiki page](
https://wiki.suse.net/index.php/YaST/jenkins) for more details.

![jenkins_enable_disable_buttons](
https://user-images.githubusercontent.com/907998/70715789-480e2400-1ceb-11ea-90d0-4524fc26d6cb.png)

*Note: The current status of the jobs is read from the displayed table,
it is recommended to reload the page before changing the jobs if the page
has been loaded long time ago.*

---

## Trello

### Better Aging

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/trello_better_aging.user.js)

You can enable aging feature in Trello which changes the style of cards which
have not been updated for long time. The feature is nice but the look of the old
cards is a bit ugly, the cards are grayed and worse readable.

This script just adds a grey left border to the old cards and keeps the original
style so the cards are better readable.



![better_trello_aging](https://user-images.githubusercontent.com/907998/147091800-abb1af77-ba32-4852-b766-5d1f7b2501be.png)