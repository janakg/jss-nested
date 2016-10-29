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

  function resolveSelector(parentSelector, nestedSelector, ref) {
    let result = ''
    const parentSelectorList = parentSelector.split(separatorRegExp)
    const nestedSelectorList = nestedSelector.split(separatorRegExp)

    for (let i = 0; i < parentSelectorList.length; i++) {
      const parentSel = parentSelectorList[i]

      for (let j = 0; j < nestedSelectorList.length; j++) {
        const nestedSel = nestedSelectorList[j]
        const isDescendant = nestedSel[0] !== '&'
        const selector = nestedSel
          // Replace all & by the parent selector.
          .replace(parentRegExp, parentSel)
          // Replace all $ref.
          .replace(refRegExp, ref)

        if (result !== '') result += ', '
        result += isDescendant ? `${parentSel} ${selector}` : selector
      }
    }

    return result
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

      if (isNested) {
        // Lazily create the ref replacer function just once for all nested rules within
        // the sheet.
        if (!replaceRef) replaceRef = getReplaceRef(container)
        const name = resolveSelector(rule.selector, prop, replaceRef)
        container.addRule(name, rule.style[prop], options)
      }
      else if (isNestedConditional) {
        addConditional(prop, rule, container)
      }

      delete rule.style[prop]
    }
  }
}
