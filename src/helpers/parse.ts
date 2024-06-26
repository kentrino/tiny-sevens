import type { format } from './format.ts'
import type { Card, Field, Game, Hand } from '../game.ts'
import { mapValues } from './mapValues.ts'

export function parse(game: ReturnType<typeof format>): Game {
  return {
    ...game,
    field: parseField(game.field),
    hands: game.hands.map(parseHand),
  }
}

function parseField(field: ReturnType<typeof format>['field']): Field {
  return {
    fields: mapValues(field, (str, suit) => {
      return str.split('').map((char) => {
        if (char === '.') {
          return undefined
        }
        return {
          suit: char,
          rank: suit,
        }
      }) as never
    }),
  }
}

function parseHand(hand: ReturnType<typeof format>['hands'][number]): Hand {
  if (hand === '') {
    return {
      cards: [],
    }
  }
  return {
    cards: hand.split(' ').map((str) => {
      return {
        suit: str[0],
        rank: str[1],
      } as Card
    }),
  }
}
