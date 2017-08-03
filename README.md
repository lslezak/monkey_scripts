# Monkey Scripts

This is a set of user scripts for the [Tampermonkey](https://tampermonkey.net/)
web browser plugin.

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
- You have to wrap the script into a simple function to make it work

> TODO: how to install a bookmarklet....

## Available User Scripts

*Note: All scripts have been tested in the Chrome browser but should hopefully
work also in the other browsers. But your mileage might vary...*

### Bugzilla

Here are some scripts usable for the (open)SUSE Bugzilla bug tracking system.

#### Bugzilla Redirection

[ :arrow_down: [Install]](
https://github.com/lslezak/monkey_scripts/raw/master/bugzilla_redirect.user.js)

The (open)SUSE Bugzilla can be accessed using several URLs:
https://bugzilla.suse.com, https://bugzilla.opensuse.org and
https://bugzilla.novell.com.

Each domain requires separate authentication so it is quite annoying if you
click a in an email or IRC chat and you have to login again because you
you are already logged in in a different domain. Also the Novell domain use
a different branding so it would be nice to always stick with the same UI.

This script always redirects you to the bugzilla.suse.com pages
automatically without need to rewrite the URL manually.


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

If a bug you are reading contains a lot of comments it would nice to spot
your comments quickly so you can see when and what have you already
commented. This script adds a blue background to all your comments so you
can find them quickly when scrolling up and down.

![monkey_bugzilla_my_comments](
https://user-images.githubusercontent.com/907998/28941004-d8b8448c-7896-11e7-9d36-6c1592459eea.png)


### Jenkins

> TODO ...