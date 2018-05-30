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
