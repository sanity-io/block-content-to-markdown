const {
  getImageUrl,
  getSerializers,
  blocksToNodes,
  mergeSerializers,
} = require('@sanity/block-content-to-hyperscript/internals')

const mdSerializers = require('./serializers')

const renderNode = (render, props, childNodes) => {
  const children = childNodes || (props.node && props.node.children)
  return render(Object.assign({}, props, {children}))
}

const {defaultSerializers, serializeSpan} = getSerializers(renderNode)
const markdownSerializers = mergeSerializers(defaultSerializers, mdSerializers)

const toMarkdown = (block, options = {}) => {
  const blocks = block || []
  const serializers = mergeSerializers(markdownSerializers, options.serializers || {})
  const props = Object.assign({}, options, {blocks, serializers, listNestMode: 'last-child'})
  return blocksToNodes(renderNode, props, defaultSerializers, serializeSpan).trim()
}

// Expose default serializers to the user
toMarkdown.defaultSerializers = defaultSerializers

// Expose logic for building image URLs from an image reference/node
toMarkdown.getImageUrl = getImageUrl

module.exports = toMarkdown
