import {
  type Action,
  type Card,
  currentPlayer,
  type Number,
  type Game,
  numbers,
  type Suit,
  suits,
  validate
} from "./game.ts"

export function intent(game: Game, input: string): Action | undefined {
  const player = currentPlayer(game)
  const hand = game.hands[player]
  if (input === 'skip') {
    return {
      type: 'skip',
      player: player
    }
  }
  const card = asCard(input)
  if (card === undefined) {
    return undefined
  }
  const action = { type: 'card' as const, player, card }
  if (validate(game, action)) {
    return action
  }
  return undefined
}

function asCard(input: string): Card | undefined {
  const [suit, number] = input.split('')
  if (number === undefined || suit === undefined) {
    return undefined
  }
  if (!numbers.includes(number as never)) {
    return undefined
  }
  if (!suits.includes(suit as never)) {
    return undefined
  }
  return {
    number: number as never as Number,
    suit: suit as never as Suit
  }
}
