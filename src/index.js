import warning from 'warning'

const separatorRegExp = /\s*,\s*/g
const parentRegExp = /&/g
const refRegExp = /\$([\w-]+)/g


/**
 * Convert nested rules to separate, remove them from original styles.
 *
 * @param {Rule} rule
 * @api public
 */
export default function jssNested() {
  // Get a function to be used for $ref replacement.
  function getReplaceRef(container) {
    return (match, name) => {
      const rule = container.getRule(name)
      if (rule) return rule.selector
      warning(false, '[JSS] Could not find the referenced rule %s. \r\n%s', name, rule)
      return name
    }
  }

  function addConditional(name, rule, container) {
    const conditionalContainer = container.getRule(name)

    if (!conditionalContainer) {
      // Add conditional to container because it does not exist yet.
      container.addRule(name, {[rule.name]: rule.style[name]})
      return
    }

    // It exists, so now check if we have already defined styles
    // for example @media print { .some-style { display: none; } } .
    const ruleToExtend = conditionalContainer.getRule(rule.name)

    if (ruleToExtend) {
      ruleToExtend.style = {
        ...ruleToExtend.style,
        ...rule.style[name]
      }
      return
    }

    // Conditional rule in container has no rule so create it.
    conditionalContainer.addRule(rule.name, rule.style[name])
  }

  function resolveSelectors(parentProp, nestedProp, ref) {
    const parentSelectors = parentProp.split(separatorRegExp)
    const nestedSelectors = nestedProp.split(separatorRegExp)

    let result = ''

    for (let i = 0; i < parentSelectors.length; i++) {
      const parent = parentSelectors[i]

      for (let j = 0; j < nestedSelectors.length; j++) {
        const nested = nestedSelectors[j]
        const hasAnd = nested[0] === '&'

        if (result) result += ', '

        // Replace all & by the parent or prefix & with the parent.
        result += hasAnd ? nested.replace(parentRegExp, parent) : `${parent} ${nested}`
      }
    }

    // Replace all $refs.
    return result.replace(refRegExp, ref)
  }

  return rule => {
    if (rule.type !== 'regular') return
    const container = rule.options.parent
    let options
    let replaceRef

    for (const prop in rule.style) {
      const isNested = prop[0] === '&'
      const isNestedConditional = prop[0] === '@'

      if (!isNested && !isNestedConditional) continue

      if (isNested) {
        if (options) options = {...options, index: options.index + 1}
        else {
          let {nestingLevel} = rule.options
          nestingLevel = nestingLevel === undefined ? 1 : nestingLevel + 1
          options = {
            ...rule.options,
            named: false,
            nestingLevel,
            index: container.indexOf(rule) + 1
          }
        }
        // Lazily create the ref replacer function just once for all nested rules within
        // the sheet.
        if (!replaceRef) replaceRef = getReplaceRef(container)
        const selector = resolveSelectors(rule.selector, prop, replaceRef)
        container.addRule(selector, rule.style[prop], options)
      }
      else if (isNestedConditional) {
        addConditional(prop, rule, container)
      }

      delete rule.style[prop]
    }
  }
}
