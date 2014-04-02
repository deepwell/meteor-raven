/**
 * Raven node.js and JavaScript logger for Meteor.
 */
'use strict';
var isRavenEnabled = false;
var trackUser = false;
var client;

/**
 * Start the logger.
 *
 * Options:
 *  * trackUser: set to true: include in each message the Meteor user's ID and
 *               username, if they're logged in
 *  * patchGlobal: set to true or a function: enables catching global uncaught
 *                 exceptions on the server. If this is set to a function, that
 *                 function is invoked after the exception is sent to Sentry.
 *                 The default callback calls `exit(1)`.
 *
 * @param settings object      Client & Server DSN strings. { client: 'dsn here', server: 'dsn here' }
 * @param options object
 */
function initialize(settings, options) {
  settings.client = settings.client || false;
  settings.server = settings.server || false;
  options = options || {};
  trackUser = typeof options.trackUser !== 'undefined' && options.trackUser === true;

  if (Meteor.isClient && settings.client !== false) {
    debug('Client initialize ' + settings.client);
    client = window.Raven;
    client.config(settings.client, {}).install();
    isRavenEnabled = true;
  }
  if (Meteor.isServer && settings.server !== false) {
    debug('Server initialize ' + settings.server);
    var Raven = Npm.require('raven');
    client = new Raven.Client(settings.server);
    if (options.patchGlobal) {
      var callback;
      if (typeof options.patchGlobal === "function") {
        callback = options.patchGlobal;
      } else {
        callback = function() {
          process.exit(1);
        };
      }
      client.patchGlobal(callback);
    }
    isRavenEnabled = true;
  }
}

/**
 * Log a message in Raven.
 *
 * @param message string|Error  Message to log
 * @param tag object            Optionally add a tag name & value eg: { component: 'charts' }
 */
function log(message, tags) {
  if (!isRavenEnabled) {
    debug('RavenLogger is not enabled');
    return;
  }

  if (trackUser)
    setUser(Meteor.user()); // temp work-around because user() is not set on load but reactive

  if (message instanceof Error)
    client.captureException(message, { tags: tags });
  else
    client.captureMessage(message, { tags: tags });
}

/**
 * Set the currently logged in user; for correlating error reports to a user.
 *
 * @param user User|null
 */
function setUser(user) {
  if (Meteor.isServer)
    return;

  if (user === null || typeof user === 'undefined') { // no one is logged in
    window.Raven.setUser(); // remove data if present
    return;
  }

  window.Raven.setUser({
    id: user._id,
    username: user.username
  });
}

/**
 * Log debugger.
 */
function debug(message) {
  //console.log(message);
}

RavenLogger = {
  initialize: initialize,
  log: log
};
