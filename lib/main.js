/**
 * Raven node.js and JavaScript logger for Meteor.
 */
let isRavenEnabled = false;
let trackUser = false;
let client;
let Raven;

if (Meteor.isServer) {
    Raven = require('raven');
} else {
    Raven = require('raven-js');
}

/**
 * Start the logger.
 *
 * Options:
 *  * trackUser: set to true: include in each message the Meteor user's ID and
 *               username, if they're logged in.
 *               NOTE: Applies to the client only.
 *  * patchGlobal: set to true or a function: enables catching global uncaught
 *                 exceptions on the server. If this is set to a function, that
 *                 function is invoked after the exception is sent to Sentry.
 *                 The default callback calls `exit(1)`.
 *                 NOTE: Applies to the server only.
 *
 * @param settings object      Client & Server DSN strings. { client: 'dsn
 *     here', server: 'dsn here' }
 * @param options object
 */
function initialize(settings, options) {
    settings.client = settings.client || false;
    settings.server = settings.server || false;
    options = options || {};
    trackUser = typeof options.trackUser !== 'undefined' &&
        options.trackUser === true;
    console.error('initialize', options);

    if (Meteor.isClient && settings.client !== false) {
        debug('Client initialize ' + settings.client);
        client = Raven;
        client.config(settings.client, options).install();
        isRavenEnabled = true;
    }
    if (Meteor.isServer && settings.server !== false) {
        debug('Server initialize ' + settings.server);
        client = Raven;
        client.config(settings.server, options).install();
        isRavenEnabled = true;
    }
}

/**
 * Log a message in Raven.
 *
 * @param message string|Error  Message to log
 * @param tag object            Optionally add a tag name & value eg: {
 *     component: 'charts' }
 */
function log(message, tags) {
    if (!isRavenEnabled) {
        debug('RavenLogger is not enabled');
        return;
    }

    if (trackUser && Meteor.isClient) {
        setUser(Meteor.user()); // temp work-around because user() is not set
                                // on load but reactive
    }

    if (message instanceof Error) {
        client.captureException(message, { tags: tags });
    } else {
        client.captureMessage(message, { tags: tags });
    }
}

/**
 * Set the currently logged in user; for correlating error reports to a user.
 *
 * @param user User|null
 */
function setUser(user) {
    if (Meteor.isServer) {
        return;
    }

    if (user === null || typeof user === 'undefined') { // no one is logged in
        Raven.setUser(); // remove data if present
        return;
    }

    Raven.setUser({
        id: user._id,
        username: user.username
    });
}

function setTagsContext(tags) {
    if (Meteor.isClient) {
        console.debug('setTagsContext', tags);
        Raven.setTagsContext(tags);
    } else {
        console.error('pre tags', tags);
        Raven.setContext({ tags });
        console.error('post tags', tags);
    }
}

/**
 * Log debugger.
 */
function debug(message) {
    //console.log(message);
}

RavenLogger = {
    initialize,
    log,
    setTagsContext,
};
