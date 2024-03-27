import type { Field, Game, Hand } from '../game.ts'
import { mapValues } from './mapValues.ts'

export function format(game: Game) {
  return {
    field: formatField(game.field),
    hands: game.hands.map(formatHand),
    turn: game.turn,
    numPlayers: game.numPlayers,
    currentPlayer: game.currentPlayer,
    losers: game.losers,
    skips: game.skips,
  } satisfies { [K in keyof Game]: unknown }
}

function formatField(field: Field) {
  return mapValues(field.fields, (v) => {
    return v.map((card) => card?.rank ?? '.').join('')
  })
}

function formatHand(hand: Hand) {
  return hand.cards.map((card) => `${card.suit}${card.rank}`).join(' ')
}
