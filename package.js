Package.describe({
  summary: 'Integrate with Raven JS for JavaScript errors and logs',
  version: '0.2.3',
  name: 'deepwell:raven',
  git: 'https://github.com/deepwell/meteor-raven.git'
});

Npm.depends({
  'raven': '0.7.2'
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@0.9.0');
  api.addFiles('lib/main.js', [ 'client', 'server' ]);
  api.addFiles('vendor/raven.js', 'client');

  api.export([
    'RavenLogger'
  ], [
    'client',
    'server'
  ]);
});
