module.exports =
  '0.8.3-force-debug': (resolve, context) =>
    context.prefs.setBoolean 'xemmet_force_debug', no
    resolve
      name: '0.8.3-force-debug'
      result: 'Changed xemmet_force_debug to false'
  '0.8.3-setup-languages': (resolve, context) =>
    try
      context.prefs.getString 'xemmet_css_languages'
      context.prefs.getString 'xemmet_html_languages'
      resolve
        name: '0.8.3-setup-languages'
        result: 'Nothing has changed: languages were already initialized'
    catch e
      context.logger.debug 'First run'
      context.prefs.setString 'xemmet_css_languages', context.baseLangs.css.join " "
      context.prefs.setString 'xemmet_html_languages', context.baseLangs.html.join " "
      resolve
        name: '0.8.3-setup-languages'
        result: 'Default languages were set using passed context @baseLangs'


