/**
 * Raven node.js and JavaScript logger for Meteor.
 */
'use strict';
var isRavenEnabled = false;
var client;

/**
 * Start the logger.
 *
 * @param settings object      Client & Server DSN strings. { client: 'dsn here', server: 'dsn here' }
 * @param options object
 */
function initialize(settings, options) {
  options = options || {};
  settings.client = settings.client || false;
  settings.server = settings.server || false;

  if (Meteor.isClient && settings.client !== false) {
    debug('Client initialize ' + settings.client);
    client = window.Raven;
    client.config(settings.client, {}).install();
    isRavenEnabled = true;
  }
  if (Meteor.isServer && settings.server !== false) {
    debug('Server initialize ' + settings.server);
    Raven = Npm.require('raven');
    client = new Raven.Client(settings.server);
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

  //setUser(Meteor.user()); // temp work-around because user() is not set on load but reactive
  if (typeof message === 'Error')
    client.captureException(message, { tags: tags });
  else
    client.captureMessage(message, { tags: tags });
}

/**
 * Set the currently logged in user, for correlating error reports to this user.
 *
 * @param user User|null
 */
function setUser(user) {
  if (user === null || typeof user === 'undefined') { // no one is logged in
    Raven.setUser(); // remove data if present
    return;
  }

  var data = {
    id: user._id,
    username: user.username,
    name: user.fullName()
  };
  Raven.setUser(data);
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
