const regExp = /&/gi

/**
 * Convert nested rules to separate, remove them from original styles.
 *
 * @param {Rule} rule
 * @api public
 */
export default function jssNested() {
  return rule => {
    if (rule.type !== 'regular') return
    let {sheet, jss} = rule.options
    let container = sheet || jss
    let {options} = rule
    for (let prop in rule.style) {
      if (prop[0] === '&') {
        if (options.named) options = {...options, named: false}
        let selector = prop.replace(regExp, rule.selector)
        container.createRule(selector, rule.style[prop], options)
        delete rule.style[prop]
      }
    }
  }
}
