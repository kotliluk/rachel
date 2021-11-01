import { getStartOfWordBeforeIndex } from '../whisperUtils'
import { sortWhispers } from '../whisperUtils'


describe('WhisperUtils (group: #ZKS, #utils)', () => {
  describe('getStartOfWordBeforeIndex', () => {
    test.each([
      { str: 'Word', index: 0, expected: 0 },
      { str: 'Word', index: 1, expected: 0 },
      { str: 'Word one two', index: 3, expected: 0 },
      { str: 'Word one two', index: 5, expected: 5 },
      { str: 'Word one two', index: 7, expected: 5 },
    ])('%s', ({ str, index, expected }) => {
      // act
      const actual = getStartOfWordBeforeIndex(str, index)
      // assert
      expect(actual).toBe(expected)
    })
  })

  describe('sortWhispers - sorts correctly and inserts HTML tags', () => {
    test.each([
      {
        whispers: ['Some', 'CVUT', 'Whispers'],
        wordBeforeCursor: '',
        expected: [
          '<span class=\'whisper-matched-word\'></span>Some',
          '<span class=\'whisper-matched-word\'></span>CVUT',
          '<span class=\'whisper-matched-word\'></span>Whispers',
        ],
      },
      {
        whispers: ['CVUT', 'Whispers', 'Some'],
        wordBeforeCursor: 's',
        expected: [
          '<span class=\'whisper-matched-word\'>S</span>ome',
          'Whi<span class=\'whisper-matched-word\'>s</span>pers',
          '<span class=\'whisper-rejected-word\'>CVUT</span>',
        ],
      },
      {
        whispers: ['CVUT', 'Whispers', 'Some'],
        wordBeforeCursor: 'sp',
        expected: [
          'Whi<span class=\'whisper-matched-word\'>sp</span>ers',
          '<span class=\'whisper-rejected-word\'>CVUT</span>',
          '<span class=\'whisper-rejected-word\'>Some</span>',
        ],
      },
      {
        whispers: ['CVUT', 'Whispers', 'Some'],
        wordBeforeCursor: 'se',
        expected: [
          '<span class=\'whisper-rejected-word\'>CVUT</span>',
          '<span class=\'whisper-rejected-word\'>Whispers</span>',
          '<span class=\'whisper-rejected-word\'>Some</span>',
        ],
      },
    ])('%s', ({ whispers, wordBeforeCursor, expected }) => {
      // act
      const actual = sortWhispers(whispers, wordBeforeCursor)
      // assert
      expect(actual).toStrictEqual(expected)
    })
  })
})
