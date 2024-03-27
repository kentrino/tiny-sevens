import { type Rank, type Suit, type Card, type Hand, numbers, suits } from './game.ts'
import { random } from './random.ts'

export function shuffle(numPlayers: number): Hand[] {
  const cards: Card[] = numbers.flatMap((number) =>
    suits.map((suit) => ({
      number,
      suit,
    })),
  )
  const shuffled = cards.sort(() => random() - 0.5)
  const hands = chunk(shuffled, Math.floor(cards.length / numPlayers))
  return hands.map((cards) => ({ cards }))
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}
