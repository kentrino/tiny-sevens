import { type Game, initialGame } from "./game.ts"
import { show } from "./show.ts"
import { ask } from "./ask.ts"
import { intent } from "./intent.ts"

export async function main() {
  let game: Game = initialGame(4)
  while (true) {
      console.log("-- -- -- -- -- -- -- -- -- -- -- -- --")
      show(game)
      const input = await ask("Your move:")
      const action = intent(game, input)
      if (action === undefined) {
          console.log('Invalid move')
          continue
      }
  }
}
