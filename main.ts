import { type Game, initialGame, run } from './game.ts'
import { show } from './show.ts'
import { ask } from './ask.ts'
import { intent } from './intent.ts'

export async function main() {
  let game: Game = initialGame(4)
  const { game: _game } = run(game, { type: 'initial' })
  game = _game
  while (true) {
    console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    show(game)
    const input = await ask('Your move:')
    const mayBeAction = intent(game, input)
    if (!mayBeAction.ok) {
      console.log(`Invalid move: ${mayBeAction.error}`)
      continue
    }
    const { game: newGame, effect } = run(game, mayBeAction.value)
    if (!effect.newLoser) {
      console.log('Player', effect.newLoser, 'is out!')
    }
    if (!effect.continue) {
      console.log('Game finished! Winner is player:', effect.winner)
      break
    }
    game = newGame
  }
}
