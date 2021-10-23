import { CsvValueSeparator, findValueSeparator, splitCSVLine } from '../csvSupport'


describe('splitCSVLine', () => {
  test('no quotes', () => {
    // arrange
    const line = 'one,two,three'
    const expected: string[] = ['one', 'two', 'three']
    // act
    const actual = splitCSVLine(line, ',')
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('simple string in quotes', () => {
    // arrange
    const line = '"one","two","three"'
    const expected: string[] = ['one', 'two', 'three']
    // act
    const actual = splitCSVLine(line, ',')
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('quotes in quotes', () => {
    // arrange
    const line = '"one ""quote""","""","""cit"""'
    const expected: string[] = ['one "quote"', '"', '"cit"']
    // act
    const actual = splitCSVLine(line, ',')
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('separators in quotes', () => {
    // arrange
    const line = '"one "",""",",",""","""'
    const expected: string[] = ['one ","', ',', '","']
    // act
    const actual = splitCSVLine(line, ',')
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('multiple types', () => {
    // arrange
    const line = '"one",two,"""three""","four ,"'
    const expected: string[] = ['one', 'two', '"three"', 'four ,']
    // act
    const actual = splitCSVLine(line, ',')
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('many quotes', () => {
    // arrange
    const line = '"one","""""""""",""""""""""'
    const expected: string[] = ['one', '""""', '""""']
    // act
    const actual = splitCSVLine(line, ',')
    // assert
    expect(actual).toStrictEqual(expected)
  })
})

describe('findValueSeparator', () => {
  test('no quotes - ,', () => {
    // arrange
    const line = 'one,two,three'
    const expected: CsvValueSeparator = ','
    // act
    const actual = findValueSeparator(line)
    // assert
    expect(actual).toStrictEqual(expected)
  })
  test('no quotes - ;', () => {
    // arrange
    const line = 'one;two;three'
    const expected: CsvValueSeparator = ';'
    // act
    const actual = findValueSeparator(line)
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('quotes - ,', () => {
    // arrange
    const line = '"one","two","three"'
    const expected: CsvValueSeparator = ','
    // act
    const actual = findValueSeparator(line)
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('quotes - ;', () => {
    // arrange
    const line = '"one";"two";"three"'
    const expected: CsvValueSeparator = ';'
    // act
    const actual = findValueSeparator(line)
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('quotes with separator values - ,', () => {
    // arrange
    const line = '"; one "" ;; "";","two","three"'
    const expected: CsvValueSeparator = ','
    // act
    const actual = findValueSeparator(line)
    // assert
    expect(actual).toStrictEqual(expected)
  })

  test('quotes with separator values - ;', () => {
    // arrange
    const line = '", one "" ,, "",";"two";"three"'
    const expected: CsvValueSeparator = ';'
    // act
    const actual = findValueSeparator(line)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})
