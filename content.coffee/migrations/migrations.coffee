module.exports =
  '0.12.0-prefs-update': (resolve, context) =>
    prefs = context.prefs
    prefs.setBoolean 'xemmet.enabled', yes
    prefs.setBoolean 'xemmet.strict', yes
    prefs.setBoolean 'xemmet.strict.wrap', yes
    prefs.setBoolean 'xemmet.wrap_lines', yes
    prefs.setBoolean 'xemmet.beautify', yes
    prefs.setBoolean 'xemmet.debug', no
    
    prefs.setString 'xemmet.languages.css', context.baseLangs.css.join " "
    prefs.setString 'xemmet.languages.html', context.baseLangs.html.join " "
    resolve
      name: '0.12.0-prefs-update'
      result: 'Prefs were reset to default'
