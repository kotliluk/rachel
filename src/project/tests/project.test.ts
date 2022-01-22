import { copyProject, isProjectObject, Project } from '../project'
import { StoredRelation } from '../../relation/storedRelation'


let project: Project = {
  relations: [StoredRelation.new('name', true).toDataObject()],
  expressions: [{ name: '', text: '' }],
  nullValuesSupport: true,
}

beforeEach(() => {
  project = {
    relations: [StoredRelation.new('name', true).toDataObject()],
    expressions: [{ name: '', text: '' }],
    nullValuesSupport: true,
  }
})

const errMsg1 = 'The file cannot be parsed to an object.'
const errMsg2 = 'The file must contain the field "relations: StoredRelationData[]" of length at least one'
const errMsg3 = 'The file must contain the field "expressions: Expression[]" of length at least one'
const errMsg4 = 'The file must contain the field "nullValuesSupport: boolean"'
const okMsg = 'OK'

describe('Project (group: #project)', () => {
  describe('isProjectObject', () => {
    test.each([
      {obj: undefined, expected: errMsg1},
      {obj: 'str', expected: errMsg1},
      {obj: {}, expected: errMsg2},
      {obj: {relations: project.relations}, expected: errMsg3},
      {obj: {relations: project.relations, expressions: project.expressions}, expected: errMsg4},
      {obj: project, expected: okMsg},
    ])('%s', ({obj, expected}) => {
      // act
      const actual = isProjectObject(obj)
      // assert
      expect(actual).toBe(expected)
    })
  })

  describe('copyProject', () => {
    test('copy has the same fields', () => {
      // arrange
      const original = project
      // act
      const copy = copyProject(original)
      // assert
      expect(copy).toStrictEqual(original)
    })

    test('changes of copy does not affect the original', () => {
      // arrange
      const original = project
      const originalNVS = original.nullValuesSupport
      const originalRelationsCount = original.relations.length
      const originalExpressionsCount = original.expressions.length
      const copy = copyProject(original)
      // act
      copy.nullValuesSupport = !copy.nullValuesSupport
      copy.relations = []
      copy.expressions = []
      // assert
      expect(original.nullValuesSupport).toBe(originalNVS)
      expect(original.relations).toHaveLength(originalRelationsCount)
      expect(original.expressions).toHaveLength(originalExpressionsCount)
    })

    test('changes of original does not affect the copy', () => {
      // arrange
      const original = project
      const copy = copyProject(original)
      const copyNVS = copy.nullValuesSupport
      const copyRelationsCount = copy.relations.length
      const copyExpressionsCount = copy.expressions.length
      // act
      original.nullValuesSupport = !original.nullValuesSupport
      original.relations = []
      original.expressions = []
      // assert
      expect(copy.nullValuesSupport).toBe(copyNVS)
      expect(copy.relations).toHaveLength(copyRelationsCount)
      expect(copy.expressions).toHaveLength(copyExpressionsCount)
    })
  })
})
