import { canFinish, type Game, initialGame, run } from './game.ts'
import { show } from './show.ts'
import { ask } from './ask.ts'
import { intent } from './intent.ts'

export async function main() {
  let game: Game = initialGame(4)
  while (true) {
    console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
    show(game)
    const input = await ask('Your move:')
    const mayBeAction = intent(game, input)
    if (!mayBeAction.ok) {
      console.log(`Invalid move: ${mayBeAction.error}`)
      continue
    }
    game = run(game, mayBeAction.value)
    const res = canFinish(game)
    if (res.ok) {
      console.log('Game finished! Winner is player:', res.value.winner)
      break
    }
  }
}
