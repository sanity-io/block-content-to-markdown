# block-content-to-markdown

Render an array of [block text](https://www.sanity.io/docs/schema-types/block-type) from Sanity to markdown.

**Note**: Currently in beta - please leave us feedback :)

## Installing

```
npm install --save @sanity/block-content-to-markdown
```

## Usage

````js
const toMarkdown = require('@sanity/block-content-to-markdown')
const client = require('@sanity/client')({
  projectId: '<your project id>',
  dataset: '<some dataset>',
  useCdn: true
})

const serializers = {
  types: {
    code: props => '```' + props.node.language + '\n' + props.node.code + '\n```'
  }
}

client.fetch('*[_type == "article"][0]').then(article => {
  console.log(toMarkdown(article.body, {serializers}))
})
````

## Options

- `serializers` - Specifies the functions used for rendering content. Merged with default serializers.
- `serializers.types` - Serializers for block types, see example above
- `serializers.marks` - Serializers for marks - data that annotates a text child of a block. See example usage below.
- `serializers.list` - Function to use when rendering a list node
- `serializers.listItem` - Function to use when rendering a list item node
- `serializers.hardBreak` - Function to use when transforming newline characters to a hard break
- `imageOptions` - When encountering image blocks, this defines which query parameters to apply in order to control size/crop mode etc.

In addition, in order to render images without materializing the asset documents, you should also specify:

- `projectId` - The ID of your Sanity project.
- `dataset` - Name of the Sanity dataset containing the document that is being rendered.

## Examples

### Rendering custom marks

```js
const input = [
  {
    _type: 'block',
    children: [
      {
        _key: 'a1ph4',
        _type: 'span',
        marks: ['s0m3k3y'],
        text: 'Sanity'
      }
    ],
    markDefs: [
      {
        _key: 's0m3k3y',
        _type: 'highlight',
        color: '#E4FC5B'
      }
    ]
  }
]

const highlight = props => {
  const content = Array.isArray(props.children) ? props.children.join('') : props.children
  return `<span style="background-color: ${props.mark.color};">${content}</span>`
}

toMarkdown(input, {serializers: {marks: {highlight}}})
```

### Specifying image options

```js
toMarkdown(input, {
  imageOptions: {w: 320, h: 240, fit: 'max'},
  projectId: 'myprojectid',
  dataset: 'mydataset'
})
```

## License

MIT-licensed. See LICENSE.
