(->
  migrations = require './migrations'
  log = require('ko/logging').getLogger 'xemmet'
  prefs = require 'ko/prefs'

  @proceed = (context) =>
    migrationsUsed = JSON.parse prefs.getString 'xemmet.migrations', '[]'
    promises = []
    for migrationName, callable of migrations when migrationName not in migrationsUsed
      migrationsUsed.push migrationName
      promises.push new Promise (resolve, reject) =>
        callable resolve, context
    prefs.setString 'xemmet.migrations', JSON.stringify migrationsUsed
    promises
).apply module.exports
