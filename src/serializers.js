const {getImageUrl} = require('@sanity/block-content-to-hyperscript/internals')

function renderChildren(props, divider = '') {
  return Array.isArray(props.children) ? props.children.join(divider) : props.children
}

function block(props) {
  const style = props.node.style || 'normal'

  if (/^h\d$/.test(style)) {
    const hashes = new Array(parseInt(style[1], 10) + 1).join('#')
    return `${hashes} ${renderChildren(props)}`
  }

  if (style === 'blockquote') {
    return `> ${renderChildren(props)}`
  }

  return renderChildren(props)
}

function RawMarkSerializer(char, props) {
  return `${char}${renderChildren(props)}${char}`
}

function link(props) {
  const {href, title} = props.mark
  const linkTitle = title ? ` ${JSON.stringify(title)}` : ''
  return `[${renderChildren(props)}](${href}${linkTitle})`
}

function list(props) {
  const indentation = new Array(props.level || 1).join('  ')
  return indentation + renderChildren(props, `\n${indentation}`)
}

function listItem(props) {
  const isBullet = props.node.listItem === 'bullet'
  const char = isBullet ? '*' : `${props.index + 1}.`
  return `${char} ${renderChildren(props)}`
}

function image(props) {
  const {title, alt} = props
  const url = getImageUrl(props)
  const imgTitle = title ? ` ${JSON.stringify(title)}` : ''
  return `![${alt || ''}](${url}${imgTitle})`
}

function container(props) {
  return renderChildren(props, '\n\n')
}

function hardBreak() {
  return '  \n'
}

module.exports = {
  types: {
    block,
    image
  },

  marks: {
    'strike-through': RawMarkSerializer.bind(null, '~~'),
    em: RawMarkSerializer.bind(null, '_'),
    code: RawMarkSerializer.bind(null, '`'),
    strong: RawMarkSerializer.bind(null, '**'),
    underline: renderChildren,
    link
  },

  list,
  listItem,
  container,
  hardBreak,
  markFallback: renderChildren
}
