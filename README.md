# ALERT!
Deployed versions prior to 6/30/2019 (< 3.4.0) might want to do a clean deployment - we're changing from Redis to MongoDB, and it doesn't translate, cleanly. This is able to run locally during development somewhat consistently.

# Southwest Price Drop Bot

This tool lets you monitor the price of Southwest flights that you've booked. It will notify you if the price drops below what you originally paid. Then you can [re-book the same flight](http://dealswelike.boardingarea.com/2014/02/28/if-a-southwest-flight-goes-down-in-price/) and get Southwest credit for the price difference. This tool also lets you monitor the price of all Southwest flights on a given day. It will notify you if any flight on that day drops below the previous cheapest flight.

Note that you need to have a [Plivo](https://www.plivo.com) account to send the text message notifications and a [Mailgun](https://www.mailgun.com) account to send the email notifications. You can run this tool without these accounts, but you won't get the notifications.

You can log in with either:

- The admin username/password combo, example: `admin` and `the-admin-password-123`
- A username/password combo, example: `mom` and `the-admin-password-123`

The second option is nice when giving out access to friends and family since it will only display alerts for the given username.  Note that the password is the same for all accounts, and the admin can see all alerts.

When creating alerts, note that the email and phone numbers are optional. If those are both left blank, the user will need to manually log in to view price drops.

## Deployment

1. Click this button: [![deploy][deploy-image]][deploy-href]
1. Fill out the config variables and click `Deploy`
1. Open up the `Heroku Scheduler` from your app's dashboard
1. Add an hourly task that runs `npm run task:check`

When updates become available, you will have to deploy them yourself using the [Heroku CLI](https://devcenter.heroku.com/articles/git).  This app follows [SemVer](http://semver.org/) in its versioning, so make sure to read the release notes when deploying a major version change.

Note: Deployed versions prior to 4/9/2018 using Mailgun will need to verify constants: `MAILGUN_DOMAIN` and `MAILGUN_EMAIL`.

Note: Deployed versions prior to 4/28/2018 (< 3.0.0) on Heroku will need to install the buildpack https://github.com/jontewks/puppeteer-heroku-buildpack

Note: Deployed versions prior to 7/21/2018 (< 3.2.0) on Heroku will need to verify the `PROXY` constant if you want to use a proxy to make the calls.

Note: Deployed versions prior to 6/30/2019 (< 3.4.0) might want to do a clean deployment - we're changing from Redis to MongoDB, and I don't think it will migrate cleanly (or at all). Otherwise, you'll need to add the mLab MongoDB add-on manually.

## Screenshots

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/welcome-no-alerts.png">
    <img src="./screenshots/welcome-no-alerts.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/new-alert.png">
    <img src="./screenshots/new-alert.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/web-list.png">
    <img src="./screenshots/web-list.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/web-detail.png">
    <img src="./screenshots/web-detail.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/email-alert.jpeg">
    <img src="./screenshots/email-alert.jpeg" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/sms.png">
    <img src="./screenshots/sms.png" height="400" />
  </a>
</kbd>

## Southwest Bot Protection

<span style="color:red">Right now, Southwest is successfully blocking requests from this project.</span>

Southwest has some very fancy bot protections in place.

* Heroku IPs, and other hosting providers, are blocked from accessing their site. Local deployments should be permitted to access their site, and some other cloud providers may work as well. The most reliable workaround is using a residential proxy service.
* There's also some tricky and obfuscated Javascript that detects headless browsers and is updated very frequently. There's a community of folks that implement headless chrome detection evasions, but it's a cat and mouse game.
  * https://github.com/paulirish/headless-cat-n-mouse/blob/master/apply-evasions.js
  * https//github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth/
  * https://github.com/shirshak55/scrapper-tools
* Use `CHROME_DEBUG=true DEBUG="puppeteer:*"` combined with `node inspect` to debug strange chrome issues.
   * Request interception will log all URL load attempts and accept all requests.
   * `slowmo` is enabled and `headless` is disabled
   * `https://infosimples.github.io/detect-headless` will be opened before a Southwest URL


## Proxy information

Instructions on deploying a proxy is outside the scope of this project. However, here's some information about proxies that might be useful:

  * A hosted (cheap) proxy that works is https://luminati.io. It's less than $1 each month and seems reliable. Most public proxies don't seem to work, I imagine there is some sort of public proxy block list that is in place.
  * You could use something like [Squid](http://www.squid-cache.org) and spin in up natively, in a container, or in a VM. Obviously you'll want to do this outside of Heroku
  * If you do use Squid, you'll want to set up port forwarding or running on a high random port, and locking down `squid.conf` with something like this to prevent someone from using your setup as an open proxy:

  ```
  acl swa dstdomain .southwest.com
  http_access allow swa
  http_access deny all
  ```
To configure the Price Drop Bot to use your proxy, define a new `PROXY` variable within the Heroku Config. The proxy format should be http://IP:port. Example: `heroku config:set PROXY='http://123.123.123.123:1234'`

## Development

To run the test suite:

```
yarn test
```

To run a console loaded up with `Alert` and `Flight` objects:

```
yarn console
```

When debugging chrome/puppeteer issues it's helpful to use the following command:

```
DEBUG="puppeteer:*" CHROME_DEBUG=true node tasks/check.js
```

This will send helpful chromium debugging output into your console, and enable some additional
logging to help debug what might be going wrong.

## Version history

### [3.5.0] - 2019-08-11
  - Update dependencies, including yarn.lock
  - Update to Node v12
### [3.4.0] - 2019-06-30
  - Move from Redis to MongoDB
  - Update scraping logic
  - Improve proxy support
  - Add some anti-bot detection measures
  - Thanks to @iloveitaly for these changes!
### [3.3.0] - 2018-12-25
  - Add support for award flights (points)
  - Updated dependencies to latest versions
### [3.2.1] - 2018-7-23
  - Merge PR from @GC-Guy to fix proxy support in checks
### [3.2.0] - 2018-7-21
  - Merge PR from @GC-Guy to add support for a proxy
### [3.1.4] - 2018-7-14
  - Update package.json
  - Merge PR from @evliu to target the price list items more dynamically
### [3.1.3] - 2018-6-14
  - Flight data loaded after page is loaded - added wait for .flight-stops selector
  - Change URL to current format
  - Fix test to handle case of no prices found
  - Add tests for expected bad inputs
### [3.1.2] - 2018-5-24
  - Add unit test for Alerts
  - Add additional logging and error handling
  - Attempt to reduce memory usage by manually calling about:blank prior to closing page
  - Add protocol to email link
### [3.1.1] - 2018-5-4
  - Fix bug with crash when email or phone number is not set but respective service is enabled
  - Add semaphore to limit number of pages open at once - hopefully fixing the "Error: Page crashed" error. Limited to 5 pages. Defaults to 5 pages at once - set ENV.MAX_PAGES to change.
### [3.1.0] - 2018-4-29
  - Add checks for invalid error
  - Add notification bars for invalid parameters
### [3.0.1] - 2018-4-28
  - Avoid multiple browser instances during task:check - reduce memory usage
  - Add nodejs buildpack for Heroku deployment
### [3.0.0] - 2018-4-28
  - Refactor to support updated Southwest site redesign, replace osmosis with puppeteer
### [2.1.0] - 2018-4-14
  - Add support for checking for the cheapest flight on a day
### [2.0.1] - 2018-4-9
  - Integrate upstream changes from PetroccoCo (email handling) and pmschartz (redesign)
### [2.0.0] - 2017-12-2
  - Support Mailgun and Plivo (email and sms)
### [1.9.5] - 2017-11-30
  - Support Mailgun
### [< 1.9.5]
  - Prior work

## Attribution

This is a fork of [minamhere's fork](https://github.com/minamhere/southwest-price-drop-bot) of [maverick915's fork](https://github.com/maverick915/southwest-price-drop-bot) of [scott113341's original project](https://github.com/scott113341/southwest-price-drop-bot).

Downstream changes were integrated from:
  * [PetroccoCo](https://github.com/PetroccoCo/southwest-price-drop-bot) - Email Handling
  * [pmschartz](https://github.com/pmschartz/southwest-price-drop-bot) - Redesign

Thanks to the following for their contributions:
  * @evliu - target the price list items more dynamically
  * @GC-Guy - proxy support
  * @iloveitaly - MongoDB, updated scraping/proxy support, anti-bot detection
  * @ribordy - lodash fix


[deploy-image]: https://www.herokucdn.com/deploy/button.svg
[deploy-href]: https://heroku.com/deploy
