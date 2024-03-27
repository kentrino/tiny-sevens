import {
  type Action,
  type Card,
  type Rank,
  type Game,
  numbers,
  type Suit,
  suits,
  validate,
} from './game.ts'
import type { Result } from './result.ts'

export function intent(game: Game, input: string): Result<Action> {
  const player = game.currentPlayer
  if (input === 'skip') {
    return { ok: true, value: { type: 'skip' as const, player } }
  }
  const card = asCard(input)
  if (!card.ok) {
    return {
      ok: false,
      error: card.error,
    }
  }
  const action = { type: 'card' as const, player, card: card.value }
  const res = validate(game, action)
  if (!res.ok) {
    return {
      ok: false,
      error: res.error,
    }
  }
  return {
    ok: true,
    value: action,
  }
}

function asCard(input: string): Result<Card> {
  if (input.length !== 2) {
    return {
      ok: false,
      error: 'Invalid length',
    }
  }
  const [suit, number] = input.toUpperCase().split('')
  if (!numbers.includes(number as never)) {
    return {
      ok: false,
      error: 'Invalid number',
    }
  }
  if (!suits.includes(suit as never)) {
    return {
      ok: false,
      error: 'Invalid suit',
    }
  }
  return {
    ok: true,
    value: {
      rank: number as Rank,
      suit: suit as Suit,
    },
  }
}
