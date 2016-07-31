![JSS logo](https://avatars1.githubusercontent.com/u/9503099?v=3&s=60)

## JSS plugin that enables support for nested selectors

Put an `&` before a selector within a rule and it will be
replaced by the parent selector and extracted to
a [separate rule](http://cssinjs.github.io/examples/plugins/jss-nested/simple/index.html).

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
    '&.clear': {
      clear: 'both'
    },
    '& .button': {
      background: 'red'
    },
    '&.selected, &.active': {
      border: '1px solid red'
    }
  }
})
```

```javascript
console.log(sheet.toString())
```
```css
.jss-0-0 {
  padding: 20px;
}
.jss-0-0:hover {
  background: blue;
}
.jss-0-0.clear {
  clear: both;
}
.jss-0-0 .button {
  background: red;
}
.jss-0-0.selected, .jss-0-0.active {
  border: 1px solid red;
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
