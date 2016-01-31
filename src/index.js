const regExp = /&/g

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

    if (parent && parent.type === 'conditional') {
      container = parent
    }

    for (const prop in rule.style) {
      if (prop[0] === '&') {
        if (!options) options = {...rule.options, named: false}
        const name = prop.replace(regExp, rule.selector)
        container.createRule(name, rule.style[prop], options)
        delete rule.style[prop]
      }
    }
  }
}
