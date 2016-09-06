const consoleWarn = console.warn.bind(console) // eslint-disable-line no-console
const parentRegExp = /&/g
const refRegExp = /\$(\w+)/g

/**
 * Convert nested rules to separate, remove them from original styles.
 *
 * @param {Rule} rule
 * @api public
 */
export default function jssNested({warn = consoleWarn} = {}) {
  // Get a function to be used for $ref replacement.
  function getReplaceRef(container) {
    return (match, name) => {
      const rule = container.getRule(name)
      if (rule) return rule.selector
      warn(`[JSS] Could not find the referenced rule "${name}".`)
      return name
    }
  }

  return rule => {
    if (rule.type !== 'regular') return
    const container = rule.options.parent
    let options
    let replaceRef
    let index

    for (const prop in rule.style) {
      if (prop[0] === '&') {
        if (!options) {
          let {level} = rule.options
          level = level === undefined ? 1 : level + 1
          if (level > 1) warn(`[JSS] Nesting is too deep "${prop}".`)
          options = {...rule.options, named: false, level, index}
        }
        index = (index === undefined ? container.indexOf(rule) : index) + 1
        options.index = index
        // Lazily create the ref replacer function just once for all nested rules within
        // the sheet.
        if (!replaceRef) replaceRef = getReplaceRef(container)

        const name = prop
          // Replace all & by the parent selector.
          .replace(parentRegExp, rule.selector)
          // Replace all $ref.
          .replace(refRegExp, replaceRef)

        container.addRule(name, rule.style[prop], options)
        delete rule.style[prop]
      }
    }
  }
}
