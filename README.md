Raven
============

Raven/Sentry integration for Meteor. Includes raven-js for frontend logging and raven for backend logging.

Provides consolidated error logging to Raven/Sentry from both the client and the server.

This package is MIT Licensed. Do whatever you like with it but any responsibility for doing so is your own.

All rights to raven are with the original authors.

RavenJS: http://raven-js.readthedocs.org/

RavenNode: https://github.com/mattrobenolt/raven-node

Usage
============
Configure your client and server DSN keys and log an error message.
<pre>
RavenLogger.initialize({
  client: 'your client DSN here',
  server: 'your server DSN here'
});
RavenLogger.log('Testing error message');
</pre>

Optionally you can pass a tag:
<pre>
RavenLogger.log('Testing error message', { component: 'system' });
</pre>

If you are using the Meteor Accounts package, you can enable user tracking on errors:
<pre>
RavenLogger.initialize({
  client: 'your client DSN here',
  server: 'your server DSN here'
}, {
  trackUser: true
});
</pre>

Raven also works very well with saving full error and exception stack traces. Simply pass an Error or a Meteor.Error object to the log method to keep the stack trace.
<pre>
RavenLogger.log(new Meteor.Error(422, 'Failed to save object to database'));
</pre>
