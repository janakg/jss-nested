const warn = console.warn.bind(console) // eslint-disable-line no-console
const parentRegExp = /&/g
const refRegExp = /\$(\w+)/g

/**
 * Get a function to be used for $ref replacement.
 */
function getReplaceRef(sheet) {
  return (match, name) => {
    const rule = sheet.getRule(name)
    if (rule) return rule.selector
    warn(`JSS: could not find the referenced rule ${name}.`)
    return name
  }
}

/**
 * Convert nested rules to separate, remove them from original styles.
 *
 * @param {Rule} rule
 * @api public
 */
export default function jssNested() {
  return rule => {
    if (rule.type !== 'regular') return
    const {sheet, jss, parent} = rule.options
    let container = sheet || jss
    let options
    let replaceRef

    if (parent && parent.type === 'conditional') {
      container = parent
    }

    for (const prop in rule.style) {
      if (prop[0] === '&') {
        if (!options) options = {...rule.options, named: false}
        // Lazily create the ref replacer function just once for all nested rules within
        // the sheet.
        if (!replaceRef) replaceRef = getReplaceRef(container)

        const name = prop
          // Replace all & by the parent selector.
          .replace(parentRegExp, rule.selector)
          // Replace all $ref.
          .replace(refRegExp, replaceRef)

        container.createRule(name, rule.style[prop], options)
        delete rule.style[prop]
      }
    }
  }
}
