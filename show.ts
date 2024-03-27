import { type Card, type Field, type Game, numbers, type Suit, suits } from './game.ts'

export function show(game: Game) {
  const player = game.currentPlayer
  const hand = game.hands[player]
  const playerDisplay = `Player ${player}'s`
  printField(game.field)
  const handDisplay = hand.cards.map((card) => fancy(card)).join(' ')
  console.log(`${playerDisplay} hand:\n ${handDisplay}`)
}

function printField(field: Field) {
  const rows = suits.map((suit) => {
    const row = numbers.map((number) => {
      const place = numbers.indexOf(number)
      const cell = field.fields[suit][place]
      if (cell === undefined) {
        return grey('..')
      }
      return fancy(cell)
    })
    return row.join(' ')
  })
  console.log(rows.join('\n'))
}

function fancy(card: Card) {
  return `${s(card.suit)}${card.number}`
}

function s(suit: Suit) {
  switch (suit) {
    case 'S': {
      return '♠'
    }
    case 'H': {
      return '♥'
    }
    case 'D': {
      return '♦'
    }
    case 'C': {
      return '♣'
    }
  }
}

function grey(str: string) {
  return `\x1b[90m${str}\x1b[0m`
}
