import { shuffle } from './shuffle.ts'
import { copy } from './copy.ts'
import type { Result } from './result.ts'
import { range } from './range.ts'

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'J' | 'Q' | 'K'
export const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'] as const

export type Suit = 'S' | 'H' | 'D' | 'C'

export const suits = ['S', 'H', 'D', 'C'] as const

export type Card = {
  number: Rank
  suit: Suit
}

type _Card<N extends Rank, S extends Suit> = {
  number: N
  suit: S
}

type _Cell<N extends Rank, S extends Suit> = _Card<N, S> | undefined
type S<N extends Rank> = _Cell<N, 'S'>
type H<N extends Rank> = _Cell<N, 'H'>
type D<N extends Rank> = _Cell<N, 'D'>
type C<N extends Rank> = _Cell<N, 'C'>

/**
 * This precise type definition is not essential for the implementation; it merely delineates the rules of the game.
 */
export type Field = {
  // biome-ignore format:
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
  currentPlayer: number
  losers: number[]
  skips: number[]
}

type CardAction = {
  player: number
  type: 'card'
  card: Card
}

export type Action =
  | {
      player: number
      type: 'skip'
    }
  | CardAction
  | {
      type: 'initial'
    }

type Effect = {
  continue: boolean
  newLoser?: number
  winner?: number
}

type PartialRule<T extends keyof Game> = (
  game: Game,
  action: Action,
) => { game: Pick<Game, T>; effect?: Effect }

export function initialGame(numPlayers: number): Game {
  return {
    field: initialField(),
    hands: shuffle(numPlayers),
    currentPlayer: 0,
    turn: 0,
    numPlayers,
    losers: [],
    skips: range(numPlayers).map(() => 0),
  }
}

export function validate(game: Game, action: Action): Result<''> {
  if (action.type === 'initial') {
    if (game.turn !== 0) {
      return { ok: false, error: 'game has already started' }
    }
    return { ok: true, value: '' }
  }
  // check player
  if (game.currentPlayer !== action.player) {
    return { ok: false, error: 'not your turn' }
  }
  // check card
  if (action.type === 'card') {
    // check hand
    const hand = game.hands[action.player]
    if (
      !hand.cards.some(
        (card) => card.number === action.card.number && card.suit === action.card.suit,
      )
    ) {
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

export function run(game: Game, action: Action): { game: Game; effect: Effect } {
  if (!validate(game, action)) {
    throw new Error('invalid action')
  }
  return apply(
    [
      initialPlayerRule,
      handAndFieldRule,
      skipRule,
      loserRule,
      nextPlayerRule,
      nextTurnRule,
      finishRule,
    ],
    game,
    action,
  )
}

const handAndFieldRule: PartialRule<'hands' | 'field'> = (game, action) => {
  switch (action.type) {
    case 'skip': {
      return {
        game: game,
      }
    }
    case 'initial': {
      return {
        game: newGamePartialAfterInitialAction(game),
      }
    }
    case 'card': {
      return {
        game: newGamePartialAfterCardAction(game, action),
      }
    }
  }
}

const skipRule: PartialRule<'skips'> = (game, action) => {
  switch (action.type) {
    case 'skip': {
      const newSkips = game.skips.map((s, i) => (i === game.currentPlayer ? s + 1 : s))
      return {
        game: { skips: newSkips },
      }
    }
    default: {
      return { game }
    }
  }
}

const loserRule: PartialRule<'losers'> = (game, action) => {
  const newLoser = game.skips.findIndex((s) => s > 3)
  const { field, hands } = placeLosersHand(game, newLoser)
  let newLosers = game.losers
  if (newLoser !== -1 && !game.losers.includes(newLoser)) {
    newLosers = [...game.losers, newLoser]
  }
  return {
    game: {
      field,
      hands,
      losers: newLosers,
    },
    effect: {
      continue: true,
      newLoser,
    },
  }
}

const initialPlayerRule: PartialRule<'currentPlayer'> = (game, action) => {
  switch (action.type) {
    case 'initial': {
      return {
        game: { currentPlayer: findPlayerWithCard(game.hands, { number: '7', suit: 'D' }) },
      }
    }
    default: {
      return { game }
    }
  }
}

const nextPlayerRule: PartialRule<'currentPlayer'> = (game, action) => {
  switch (action.type) {
    case 'skip': {
      return {
        game: { currentPlayer: nextPlayer(game) },
      }
    }
    case 'initial': {
      return {
        game,
      }
    }
    case 'card': {
      return {
        game: { currentPlayer: nextPlayer(game) },
      }
    }
  }
}

const nextTurnRule: PartialRule<'turn'> = (game, action) => {
  switch (action.type) {
    case 'initial': {
      return {
        game: { turn: 0 },
      }
    }
    default: {
      return {
        game: { turn: game.turn + 1 },
      }
    }
  }
}

const finishRule: PartialRule<'losers'> = (game, _) => {
  if (game.losers.length === game.numPlayers - 1) {
    const winner = range(game.numPlayers).find((i) => !game.losers.includes(i))
    if (typeof winner === 'undefined') {
      throw new Error('Illegal state')
    }
    return {
      game,
      effect: {
        continue: false,
        winner,
      },
    }
  }
  const canFinish = game.hands.some(
    (hand, player) => hand.cards.length === 0 && !game.losers.includes(player),
  )
  if (canFinish) {
    return {
      game,
      effect: {
        continue: false,
        winner: game.hands.findIndex((hand) => hand.cards.length === 0),
      },
    }
  }
  return { game }
}

function apply(
  rules: PartialRule<never>[],
  game: Game,
  action: Action,
): { game: Game; effect: Effect } {
  return rules.reduce(
    (acc, rule): { game: Game; effect: Effect } => {
      const { game, effect } = rule(acc.game, action)
      const defaultContinue = true
      return {
        game: { ...acc.game, ...game },
        effect: {
          continue: acc.effect.continue && (effect?.continue ?? defaultContinue),
          newLoser: effect?.newLoser ?? acc.effect.newLoser,
          winner: effect?.winner ?? acc.effect.winner,
        },
      }
    },
    {
      game,
      effect: {
        continue: true,
      } as Effect,
    },
  )
}

function findPlayerWithCard(hands: Hand[], card: Card): number {
  return hands.findIndex((hand) =>
    hand.cards.some((c) => c.number === card.number && c.suit === card.suit),
  )
}

/**
 * Place the loser's hand on the field and remove it from the hand.
 * @param hands
 * @param field
 * @param loser
 */
function placeLosersHand(
  { hands, field }: Pick<Game, 'hands' | 'field'>,
  loser: number,
): Pick<Game, 'hands' | 'field'> {
  if (loser < 0) {
    return { hands, field }
  }
  if (loser >= hands.length) {
    throw new Error('Invalid loser index')
  }
  const loserHand = hands[loser]
  const newField = loserHand.cards.reduce((f, card) => place(f, card), field)
  const newHands = hands.map((hand, i) => {
    if (i === loser) {
      return { cards: [] }
    }
    return hand
  })
  return {
    hands: newHands,
    field: newField,
  }
}

/**
 * Place all 7s on the field and remove them from the hands.
 * @param game
 */
function newGamePartialAfterInitialAction(game: Game): Pick<Game, 'hands' | 'field'> {
  let field = game.field
  for (const suit of suits) {
    field = place(field, { number: '7', suit: suit })
  }
  return {
    field,
    hands: game.hands.map((hand) => {
      return {
        cards: hand.cards.filter((card) => card.number !== '7'),
      }
    }),
  }
}

/**
 * Place a card on the field and remove it from the hand.
 * @param game
 * @param action
 */
function newGamePartialAfterCardAction(
  game: Game,
  action: CardAction,
): Pick<Game, 'hands' | 'field'> {
  function isSame(a: Card, b: Card): boolean {
    return a.number === b.number && a.suit === b.suit
  }
  return {
    field: place(game.field, action.card),
    hands: game.hands.map((hand, player) => {
      if (player === action.player) {
        return {
          cards: hand.cards.filter((card) => !isSame(card, action.card)),
        }
      }
      return hand
    }),
  }
}

function nextPlayer(game: Game): number {
  let current = game.currentPlayer
  if (game.losers.length === game.numPlayers - 1) {
    throw new Error('Illegal state; game should have been finished')
  }
  while (true) {
    current = (current + 1) % game.numPlayers
    if (!game.losers.includes(current)) {
      return current
    }
  }
}

function initialField(): Field {
  const u = undefined
  return {
    fields: {
      S: [u, u, u, u, u, u, u, u, u, u, u, u, u, u],
      H: [u, u, u, u, u, u, u, u, u, u, u, u, u, u],
      D: [u, u, u, u, u, u, u, u, u, u, u, u, u, u],
      C: [u, u, u, u, u, u, u, u, u, u, u, u, u, u],
    },
  }
}

function canPlace(field: Field, card: Card): Result<''> {
  const rightPlace = numbers.indexOf(card.number)
  const right = field.fields[card.suit][rightPlace + 1]
  const left = field.fields[card.suit][rightPlace - 1]
  if (right === undefined && left === undefined) {
    return { ok: false, error: 'both neighbors are empty' }
  }
  return { ok: true, value: '' }
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
      [card.suit]: newRow,
    },
  }
}
