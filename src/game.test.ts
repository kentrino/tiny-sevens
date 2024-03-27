import { expect, test, describe, it } from 'bun:test'
import { random } from './random.ts'
import { type Action, initialGame, run } from './game.ts'
import { format } from './helpers/format.ts'
import { apply } from './helpers/apply.ts'
import { parse } from './helpers/parse.ts'

describe('game', () => {
  function initGame() {
    random('test seed')
    return initialGame(4)
  }

  it('format', () => {
    const game = initGame()
    expect(format(game)).toEqual({
      currentPlayer: 0,
      field: {
        C: '..............',
        D: '..............',
        H: '..............',
        S: '..............',
      },
      hands: [
        'SK S2 CK D7 C0 S9 D0 S8 HJ CA HK H5 SQ',
        'SA DK H4 D8 D9 S0 SJ C5 HQ H0 HA H2 D5',
        'H9 C9 DJ DA CQ CJ H6 DQ S3 C3 D2 C8 D3',
        'C2 C4 H3 S4 H7 S6 S7 D4 C7 H8 D6 S5 C6',
      ],
      losers: [],
      numPlayers: 4,
      skips: [0, 0, 0, 0],
      turn: 0,
    })
  })

  it('parse', () => {
    const game = initGame()
    expect(
      parse({
        currentPlayer: 0,
        field: {
          C: '..............',
          D: '..............',
          H: '..............',
          S: '..............',
        },
        hands: [
          'SK S2 CK D7 C0 S9 D0 S8 HJ CA HK H5 SQ',
          'SA DK H4 D8 D9 S0 SJ C5 HQ H0 HA H2 D5',
          'H9 C9 DJ DA CQ CJ H6 DQ S3 C3 D2 C8 D3',
          'C2 C4 H3 S4 H7 S6 S7 D4 C7 H8 D6 S5 C6',
        ],
        losers: [],
        numPlayers: 4,
        skips: [0, 0, 0, 0],
        turn: 0,
      }),
    ).toEqual(game)
  })

  it('after initial action', () => {
    const game = initGame()
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
        'SK S2 CK C0 S9 D0 S8 HJ CA HK H5 SQ',
        'SA DK H4 D8 D9 S0 SJ C5 HQ H0 HA H2 D5',
        'H9 C9 DJ DA CQ CJ H6 DQ S3 C3 D2 C8 D3',
        'C2 C4 H3 S4 S6 D4 H8 D6 S5 C6',
      ],
      losers: [],
      numPlayers: 4,
      skips: [0, 0, 0, 0],
      turn: 0,
    })
  })

  it('after initial action and first move', () => {
    const startGame = initGame()
    const actions: Action[] = [
      { type: 'initial' },
      { type: 'card', card: { number: '8', suit: 'S' }, player: 0 },
    ]
    const { game, effect } = apply(actions, startGame)
    expect(format(game)).toEqual({
      currentPlayer: 1,
      field: {
        C: '......7.......',
        D: '......7.......',
        H: '......7.......',
        S: '......78......',
      },
      hands: [
        'SK S2 CK C0 S9 D0 HJ CA HK H5 SQ',
        'SA DK H4 D8 D9 S0 SJ C5 HQ H0 HA H2 D5',
        'H9 C9 DJ DA CQ CJ H6 DQ S3 C3 D2 C8 D3',
        'C2 C4 H3 S4 S6 D4 H8 D6 S5 C6',
      ],
      losers: [],
      numPlayers: 4,
      skips: [0, 0, 0, 0],
      turn: 1,
    })
  })
  it('many skips', () => {
    const startGame = initGame()
    const actions: Action[] = [
      { type: 'initial' },
      { type: 'card', card: { number: '8', suit: 'S' }, player: 0 },
      { type: 'skip', player: 1 },
      { type: 'card', card: { number: '6', suit: 'H' }, player: 2 },
      { type: 'card', card: { number: '8', suit: 'H' }, player: 3 },
      { type: 'card', card: { number: '5', suit: 'H' }, player: 0 },
      { type: 'skip', player: 1 },
      { type: 'card', card: { number: '8', suit: 'C' }, player: 2 },
      { type: 'card', card: { number: '6', suit: 'C' }, player: 3 },
      { type: 'card', card: { number: '9', suit: 'S' }, player: 0 },
      { type: 'skip', player: 1 },
      { type: 'card', card: { number: '9', suit: 'H' }, player: 2 },
      { type: 'card', card: { number: '6', suit: 'D' }, player: 3 },
      { type: 'skip', player: 0 },
      { type: 'skip', player: 1 },
    ]
    const { game, effect } = apply(actions, startGame)
    expect(format(game)).toEqual({
      currentPlayer: 2,
      field: {
        C: '....5678......',
        D: '....56789...K.',
        H: 'A2.4567890.Q..',
        S: 'A.....7890J...',
      },
      hands: [
        'SK S2 CK C0 D0 HJ CA HK SQ',
        '',
        'C9 DJ DA CQ CJ DQ S3 C3 D2 D3',
        'C2 C4 H3 S4 S6 D4 S5',
      ],
      losers: [1],
      numPlayers: 4,
      skips: [1, 4, 0, 0],
      turn: 14,
    })
    expect(effect).toEqual({
      newLoser: 1,
      continue: true,
    })
  })

  it('winner is correct', () => {
    const initialGame = parse({
      currentPlayer: 2,
      field: {
        C: '....5678......',
        D: '....56789...K.',
        H: 'A2.4567890.Q..',
        S: 'A.....7890J...',
      },
      hands: [
        'SK S2 CK C0 D0 HJ CA HK SQ',
        '',
        'C9 DJ DA CQ CJ DQ S3 C3 D2 D3',
        'C2 C4 H3 S4 S6 D4 S5',
      ],
      losers: [1],
      numPlayers: 4,
      skips: [1, 4, 0, 0],
      turn: 14,
    })

    const actions: Action[] = [
      { type: 'card', card: { number: '9', suit: 'C' }, player: 2 },
      { type: 'card', card: { number: '6', suit: 'S' }, player: 3 },
      { type: 'card', card: { number: '0', suit: 'D' }, player: 0 },
      { type: 'card', card: { number: 'J', suit: 'D' }, player: 2 },
      { type: 'card', card: { number: '3', suit: 'H' }, player: 3 },
      { type: 'card', card: { number: 'K', suit: 'H' }, player: 0 },
      { type: 'skip', player: 2 },
      { type: 'card', card: { number: '4', suit: 'C' }, player: 3 },
      { type: 'card', card: { number: 'J', suit: 'H' }, player: 0 },
      { type: 'card', card: { number: '3', suit: 'C' }, player: 2 },
      { type: 'card', card: { number: '2', suit: 'C' }, player: 3 },
      { type: 'card', card: { number: '0', suit: 'C' }, player: 0 },
      { type: 'card', card: { number: 'J', suit: 'C' }, player: 2 },
      { type: 'card', card: { number: '4', suit: 'D' }, player: 3 },
      { type: 'card', card: { number: 'Q', suit: 'S' }, player: 0 },
      { type: 'card', card: { number: 'Q', suit: 'C' }, player: 2 },
      { type: 'card', card: { number: '5', suit: 'S' }, player: 3 },
      { type: 'card', card: { number: 'A', suit: 'C' }, player: 0 },
      { type: 'card', card: { number: '3', suit: 'D' }, player: 2 },
      { type: 'card', card: { number: '4', suit: 'S' }, player: 3 },
    ]
    const { game, effect } = apply(actions, initialGame)
    expect(format(game)).toEqual({
      currentPlayer: 0,
      field: {
        C: 'A234CCCC90JQ..',
        D: '..34DDDDD0J.D.',
        H: 'HH3HHHHHHHJHK.',
        S: 'S..456SSSSSQ..',
      },
      hands: ['SK S2 CK', '', 'DA DQ S3 D2', ''],
      losers: [1],
      numPlayers: 4,
      skips: [1, 4, 1, 0],
      turn: 34,
    })
    expect(effect).toEqual({
      newLoser: undefined,
      continue: false,
      winner: 3,
    })
  })
})
