import { type Action, type Effect, type Game, run, validate } from '../game.ts'

export function apply(actions: Action[], game: Game) {
  return actions.reduce(
    ({ game, effect }, action) => {
      const { game: newGame, effect: newEffect } = run(game, action)
      return { game: newGame, effect: newEffect }
    },
    {
      game,
      effect: {
        continue: true,
      } as Effect,
    },
  )
}
