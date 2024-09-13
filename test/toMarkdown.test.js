/* eslint-disable id-length, no-sync */
const fs = require('fs')
const path = require('path')
const toMarkdown = require('../src/toMarkdown')

test('renders undefined block as empty string', () => {
  expect(toMarkdown()).toEqual('')
})

test('renders null block as empty string', () => {
  expect(toMarkdown(null)).toEqual('')
})

test('renders empty block array as empty string', () => {
  expect(toMarkdown([])).toEqual('')
})

const code = props => `\`\`\`${props.node.language}\n${props.node.code}\n\`\`\``
const highlight = ({mark, children}) => {
  const content = Array.isArray(children) ? children.join('') : children
  return `<span style="border: ${mark.thickness}px solid;">${content}</span>`
}

const testsDir = path.dirname(require.resolve('@sanity/block-content-tests'))
const fixturesDir = path.join(testsDir, 'fixtures')
const fixtures = fs.readdirSync(fixturesDir).filter(file => path.extname(file) === '.js')
const options = {
  projectId: '3do82whm',
  dataset: 'production',
  serializers: {types: {code}, marks: {highlight}}
}

fixtures.forEach(fixture => {
  const {input} = require(path.join(fixturesDir, fixture))
  test(fixture.slice(0, -3), () => {
    expect(toMarkdown(input, options)).toMatchSnapshot()
  })
})

test('builds images with passed query params', () => {
  const {input} = require('@sanity/block-content-tests/fixtures/013-materialized-image-support')
  const result = toMarkdown(input, {imageOptions: {w: 320, h: 240}})
  expect(result).toContain('5748x3832.jpg?w=320&h=240')
})

function getMarkedInput(mark, text = '   Sanity   ') {
  return [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          marks: [],
          text: 'before'
        },
        {
          _type: 'span',
          marks: [mark],
          text: text
        },
        {
          _type: 'span',
          marks: [],
          text: 'after'
        }
      ],
      markDefs: []
    }
  ]
}

;['strike-through', 'em', 'code', 'strong'].forEach(mark => {
  test(`places ${mark} symbols appropriately with respect to whitespace`, () => {
    expect(toMarkdown(getMarkedInput(mark), options)).toMatchSnapshot()
  })
})
;['strike-through', 'em', 'strong'].forEach(mark => {
  it(`does not include ${mark} symbols around empty content`, () => {
    expect(toMarkdown(getMarkedInput(mark, ' '))).toMatchSnapshot()
  })
})

test('places nested marks appropriately with respect to whitespace', () => {
  const input = [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: '  before',
          marks: ['strike-through']
        },
        {
          _type: 'span',
          marks: ['em', 'strike-through', 'strong'],

          text: '   Sanity   '
        },
        {
          _type: 'span',
          text: 'after  '
        }
      ],
      markDefs: []
    }
  ]

  expect(toMarkdown(input, options)).toMatchSnapshot()
})

function getSplitEmptyMarkInput(mark, emptyMarks) {
  return [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          marks: [mark],
          text: 'before'
        },
        {
          _type: 'span',
          marks: emptyMarks,
          text: ''
        },
        {
          _type: 'span',
          marks: [mark],
          text: 'after'
        }
      ],
      markDefs: []
    }
  ]
}

;['strike-through', 'em', 'strong', 'underline'].forEach(emptyMark => {
  ;['strike-through', 'em', 'code', 'strong'].forEach(mark => {
    test(`sanitizes empty ${emptyMark} blocks to prevent malformed ${mark} syntax`, () => {
      expect(toMarkdown(getSplitEmptyMarkInput(mark, [emptyMark]), options)).toMatchSnapshot()
    })
  })
})
;['strike-through', 'em', 'strong', 'underline'].forEach(mark => {
  test(`allows empty code marks between ${mark} marks`, () => {
    expect(toMarkdown(getSplitEmptyMarkInput(mark, ['code']), options)).toMatchSnapshot()
  })
})
;['strike-through', 'em', 'strong', 'underline'].forEach(emptyMark => {
  ;['strike-through', 'em', 'strong', 'underline'].forEach(mark => {
    test(`after sanitiziation - allows empty code marks between ${mark} marks`, () => {
      expect(
        toMarkdown(getSplitEmptyMarkInput(mark, ['code', emptyMark]), options)
      ).toMatchSnapshot()
    })
  })
})
