import { describe, expect, it } from 'vitest'
import { columnOf, describeCell, nextFocusIndex, rowOf } from './board'

describe('rowOf and columnOf', () => {
  it('map every index to its row and column', () => {
    const expected = [
      { index: 0, row: 0, column: 0 },
      { index: 1, row: 0, column: 1 },
      { index: 2, row: 0, column: 2 },
      { index: 3, row: 1, column: 0 },
      { index: 4, row: 1, column: 1 },
      { index: 5, row: 1, column: 2 },
      { index: 6, row: 2, column: 0 },
      { index: 7, row: 2, column: 1 },
      { index: 8, row: 2, column: 2 },
    ]

    for (const { index, row, column } of expected) {
      expect(rowOf(index)).toBe(row)
      expect(columnOf(index)).toBe(column)
    }
  })
})

describe('describeCell', () => {
  it('describes empty, X, and O cells', () => {
    expect(describeCell(0, null, false)).toBe('Row 1, column 1, empty')
    expect(describeCell(5, 'X', false)).toBe('Row 2, column 3, X')
    expect(describeCell(7, 'O', false)).toBe('Row 3, column 2, O')
  })

  it('marks winning cells', () => {
    expect(describeCell(4, 'X', true)).toBe('Row 2, column 2, X, winning cell')
  })
})

describe('nextFocusIndex', () => {
  it('moves within a row without wrapping', () => {
    expect(nextFocusIndex(0, 'ArrowRight')).toBe(1)
    expect(nextFocusIndex(1, 'ArrowRight')).toBe(2)
    expect(nextFocusIndex(2, 'ArrowRight')).toBe(2)
    expect(nextFocusIndex(2, 'ArrowLeft')).toBe(1)
    expect(nextFocusIndex(0, 'ArrowLeft')).toBe(0)
  })

  it('moves between rows without crossing boundaries', () => {
    expect(nextFocusIndex(0, 'ArrowDown')).toBe(3)
    expect(nextFocusIndex(4, 'ArrowDown')).toBe(7)
    expect(nextFocusIndex(6, 'ArrowDown')).toBe(6)
    expect(nextFocusIndex(7, 'ArrowUp')).toBe(4)
    expect(nextFocusIndex(2, 'ArrowUp')).toBe(2)
  })

  it('jumps to row boundaries with Home and End', () => {
    expect(nextFocusIndex(5, 'Home')).toBe(3)
    expect(nextFocusIndex(3, 'End')).toBe(5)
    expect(nextFocusIndex(8, 'Home')).toBe(6)
    expect(nextFocusIndex(6, 'End')).toBe(8)
  })

  it('returns the current index for unknown keys', () => {
    expect(nextFocusIndex(4, 'Enter')).toBe(4)
  })
})
