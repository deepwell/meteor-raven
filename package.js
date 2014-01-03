Package.describe({
  summary: 'Integrate with Raven JS for JavaScript errors and logs'
});

Npm.depends({
  'raven': '0.6.0'
});

Package.on_use(function (api, where) {
  api.add_files('lib/main.js', [ 'client', 'server' ]);
  api.add_files('vendor/raven.js', 'client');

  /**
   * Export the if meteor >= 0.6.5
   */
  if (typeof api.export !== 'undefined') {
    api.export([
      'RavenLogger'
    ], [
      'client',
      'server'
    ]);
  }
});
