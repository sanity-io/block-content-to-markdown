const {
  getImageUrl,
  getSerializers,
  blocksToNodes,
  mergeSerializers
} = require('@sanity/block-content-to-hyperscript/internals')

const mdSerializers = require('./serializers')

const disallowedEmptyMarks = ['strike-through', 'em', 'strong', 'underline']

const sanitizeEmptyMarkedSpans = (blocks = []) => {
  const sanitizedBlock = block => {
    if (block._type === 'block' && Array.isArray(block.children)) {
      const newBlock = Object.assign({}, block)

      newBlock.children = sanitizeEmptyMarkedSpans(block.children)

      return newBlock
    }

    if (block._type === 'span' && block.text.length == 0 && Array.isArray(block.marks)) {
      const allowedEmptyMarks = block.marks.filter(mark => {
        return !disallowedEmptyMarks.includes(mark)
      })

      if (allowedEmptyMarks.length == 0) {
        return null
      } else {
        return Object.assign({}, block, {
          marks: allowedEmptyMarks
        })
      }
    }

    return block
  }

  return Array.isArray(blocks)
    ? blocks.map(sanitizedBlock).filter(block => !!block)
    : sanitizedBlock(blocks)
}

const renderNode = (render, props, childNodes) => {
  const children = childNodes || (props.node && props.node.children)
  return render(Object.assign({}, props, {children}))
}

const {defaultSerializers, serializeSpan} = getSerializers(renderNode)
const markdownSerializers = mergeSerializers(defaultSerializers, mdSerializers)

const toMarkdown = (block, options = {}) => {
  const blocks = sanitizeEmptyMarkedSpans(block || [])
  const serializers = mergeSerializers(markdownSerializers, options.serializers || {})
  const props = Object.assign({}, options, {blocks, serializers, listNestMode: 'last-child'})
  return blocksToNodes(renderNode, props, defaultSerializers, serializeSpan).trim()
}

// Expose default serializers to the user
toMarkdown.defaultSerializers = defaultSerializers

// Expose logic for building image URLs from an image reference/node
toMarkdown.getImageUrl = getImageUrl

module.exports = toMarkdown
