import { expect, test, describe, it } from 'bun:test'
import { random } from './random.ts'
import { initialGame, run } from './game.ts'
import { format } from './helpers/format.ts'

describe('game', () => {
  function initializeRandomWithSeed() {
    random("test seed")
  }

  it('format', () => {
    initializeRandomWithSeed()
    const game = initialGame(4)
    expect(format(game)).toEqual({
      currentPlayer: 0,
      field: {
        C: '..............',
        D: '..............',
        H: '..............',
        S: '..............',
      },
      hands: [
        'KS 2S KC 7D 0C 9S 0D 8S JH AC KH 5H QS',
        'AS KD 4H 8D 9D 0S JS 5C QH 0H AH 2H 5D',
        '9H 9C JD AD QC JC 6H QD 3S 3C 2D 8C 3D',
        '2C 4C 3H 4S 7H 6S 7S 4D 7C 8H 6D 5S 6C',
      ],
      losers: [],
      numPlayers: 4,
      skips: [0, 0, 0, 0],
      turn: 0,
    })
  })

  it('after initial action', () => {
    initializeRandomWithSeed()
    const game = initialGame(4)
    const { game: newGame } = run(game, { type: 'initial' })
    expect(format(newGame)).toEqual({
      currentPlayer: 0,
      field: {
        C: '......7.......',
        D: '......7.......',
        H: '......7.......',
        S: '......7.......',
      },
      hands: [
        'KS 2S KC 0C 9S 0D 8S JH AC KH 5H QS',
        'AS KD 4H 8D 9D 0S JS 5C QH 0H AH 2H 5D',
        '9H 9C JD AD QC JC 6H QD 3S 3C 2D 8C 3D',
        '2C 4C 3H 4S 6S 4D 8H 6D 5S 6C',
      ],
      losers: [],
      numPlayers: 4,
      skips: [0, 0, 0, 0],
      turn: 0,
    })
  })
})
