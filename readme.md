![JSS logo](https://avatars1.githubusercontent.com/u/9503099?v=3&s=60)

## JSS plugin that enables support for nested selectors

Put an `&` before a selector within a rule and it will be
replaced by the parent selector and extracted to
a [separate rule](http://cssinjs.github.io/examples/plugins/jss-nested/simple/index.html).

You can also reference a local rule within the style sheet by using `$ruleName`.

[Demo](http://cssinjs.github.io/examples/index.html#plugin-jss-nested) -
[JSS](https://github.com/cssinjs/jss)

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/cssinjs/lobby)


## Usage example

```javascript
import jss from 'jss'
import nested from 'jss-nested'

jss.use(nested())

const sheet = jss.createStyleSheet({
  container: {
    padding: '20px',
    '&:hover': {
      background: 'blue'
    },
    // Add a global .clear class to the container.
    '&.clear': {
      clear: 'both'
    },
    // Reference a global .button scoped to the container.
    '& .button': {
      background: 'red'
    },
    // Use multiple container refs in one selector
    '&.selected, &.active': {
      border: '1px solid red'
    },
    // Reference the local rule "button".
    '& $button': {
      padding: '10px'
    }
  },
  button: {
    color: 'red'
  }
})
```

```javascript
console.log(sheet.toString())
```
```css
.container-12345 {
  padding: 20px;
}
.container-12345:hover {
  background: blue;
}
.container-12345.clear {
  clear: both;
}
.container-12345 .button {
  background: red;
}
.container-12345.selected, .container-12345.active {
  border: 1px solid red;
}
.button-12341 {
  color: red;
}
.container-12345 .button-12341 {
  padding: 10px;
}
```

```javascript
console.log(sheet.classes)
```
```javascript
{ container: "jss-0-0" }
```

## Issues

File a bug against [cssinjs/jss prefixed with \[jss-nested\]](https://github.com/cssinjs/jss/issues/new?title=[jss-nested]%20).

## Run tests

```bash
npm i
npm run test
```

## License

MIT
