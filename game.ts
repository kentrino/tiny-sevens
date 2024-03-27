import { shuffle } from "./shuffle.ts"
import { copy } from "./copy.ts"
import type { Result } from "./result.ts"

export type Number = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'J' | 'Q' | 'K'
export const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'] as const

export type Suit = 'S' | 'H' | 'D' | 'C'

export const suits = ['S', 'H', 'D', 'C'] as const

export type Card = {
  number: Number
  suit: Suit
}

type _Card<N extends Number, S extends Suit> = {
  number: N
  suit: S
}

type _Cell<N extends Number, S extends Suit> = _Card<N, S> | undefined
type S<N extends Number> = _Cell<N, 'S'>
type H<N extends Number> = _Cell<N, 'H'>
type D<N extends Number> = _Cell<N, 'D'>
type C<N extends Number> = _Cell<N, 'C'>

/**
 * This precise type definition is not essential for the implementation; it merely delineates the rules of the game.
 */
export type Field = {
  fields: {
    S: [S<'A'>, S<'2'>, S<'3'>, S<'4'>, S<'5'>, S<'6'>, S<'7'>, S<'8'>, S<'9'>, S<'0'>, S<'J'>, S<'J'>, S<'Q'>, S<'K'>],
    H: [H<'A'>, H<'2'>, H<'3'>, H<'4'>, H<'5'>, H<'6'>, H<'7'>, H<'8'>, H<'9'>, H<'0'>, H<'J'>, H<'J'>, H<'Q'>, H<'K'>],
    D: [D<'A'>, D<'2'>, D<'3'>, D<'4'>, D<'5'>, D<'6'>, D<'7'>, D<'8'>, D<'9'>, D<'0'>, D<'J'>, D<'J'>, D<'Q'>, D<'K'>],
    C: [C<'A'>, C<'2'>, C<'3'>, C<'4'>, C<'5'>, C<'6'>, C<'7'>, C<'8'>, C<'9'>, C<'0'>, C<'J'>, C<'J'>, C<'Q'>, C<'K'>],
  }
}

export type Hand = {
  cards: Card[]
}

export type Game = {
  field: Field
  hands: Hand[]
  turn: number
  numPlayers: number
}

function initialField(): Field {
  const u = undefined
  return {
    fields: {
      S: [u, u, u, u, u, u, {number: '7', suit: 'S'}, u, u, u, u, u, u, u],
      H: [u, u, u, u, u, u, {number: '7', suit: 'H'}, u, u, u, u, u, u, u],
      D: [u, u, u, u, u, u, {number: '7', suit: 'D'}, u, u, u, u, u, u, u],
      C: [u, u, u, u, u, u, {number: '7', suit: 'C'}, u, u, u, u, u, u, u],
    }
  }
}

export function initialGame(numPlayers: number): Game {
  return {
    field: initialField(),
    hands: shuffle(numPlayers),
    turn: 0,
    numPlayers
  }
}

export type Action = {
  player: number
  type: 'skip'
} | {
  player: number
  type: 'card',
  card: Card
}

function canPlace(field: Field, card: Card): Result<''> {
  const rightPlace = numbers.indexOf(card.number)
  if (rightPlace < 7) {
    const right = rightPlace + 1
    const ok = typeof field.fields[card.suit][right] !== 'undefined'
    if (ok) {
      return { ok: true, value: '' }
    }
    return {
      ok: false,
      error: 'right-hand neighbor is empty'
    }
  }
  const left = rightPlace - 1
  const ok = typeof field.fields[card.suit][left] !== 'undefined'
  if (ok) {
    return { ok: true, value: '' }
  }
  return {
    ok: false,
    error: 'left-hand neighbor is empty'
  }
}

function place(field: Field, card: Card): Field {
  const copied = copy(field)
  const rightPlace = numbers.indexOf(card.number)
  const newRow = copied.fields[card.suit].map((c, i) => {
    if (i === rightPlace) {
      return card
    }
    return c
  })
  return {
    fields: {
      ...copied.fields,
      [card.suit]: newRow
    }
  }
}

export function currentPlayer(game: Game) {
  return game.turn % game.numPlayers
}

export function validate(game: Game, action: Action): Result<''> {
  // check player
  if (currentPlayer(game) !== action.player) {
    return {ok: false, error: 'not your turn'}
  }
  // check card
  if (action.type === 'card') {
    // check hand
    const hand = game.hands[action.player]
    if (!hand.cards.some((card) => card.number === action.card.number && card.suit === action.card.suit)) {
      return { ok: false, error: 'you do not have the card' }
    }
    // check field
    const res = canPlace(game.field, action.card)
    if (!res.ok) {
      return { ok: false, error: res.error }
    }
  }
  return { ok: true, value: '' }
}

export function run(game: Game, action: Action): Game {
  function isSame(a: Card, b: Card): boolean {
    return a.number === b.number && a.suit === b.suit
  }
  if (!validate(game, action)) {
    throw new Error('invalid action')
  }
  if (action.type === 'skip') {
    return {
      ...game,
      turn: game.turn + 1
    }
  }
  return {
    ...game,
    field: place(game.field, action.card),
    hands: game.hands.map((hand, player) => {
      if (player === action.player) {
        return {
          cards: hand.cards.filter((card) => !isSame(card, action.card))
        }
      }
      return hand
    }),
    turn: game.turn + 1
  }
}

export function canContinue(game: Game): boolean {
  return game.hands.every((hand) => hand.cards.length > 0)
}

export function winner(game: Game): number | undefined {
  if (canContinue(game)) {
    return undefined
  }
  return game.hands.findIndex((hand) => hand.cards.length === 0)
}
