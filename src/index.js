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
    const {sheet, jss} = rule.options
    const container = sheet || jss
    let {options} = rule
    for (const prop in rule.style) {
      if (prop[0] === '&') {
        if (options.named) options = {...options, named: false}
        const selector = prop.replace(regExp, rule.selector)
        container.createRule(selector, rule.style[prop], options)
        delete rule.style[prop]
      }
    }
  }
}
