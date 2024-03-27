import { main } from './main.ts'
import { Command } from 'commander'
import { z } from 'zod'

const program = new Command()
  .name('tiny-sevens')
  .description('Tiny Sevens game\n\nSubmit your move through stdin in the following format: \n' +
    '  either a card notation such as `3S` for the Three of Spades,\n' +
    '  or the word `skip` to pass your turn.')
  .option('-s, --seed <string>', 'seed')
  .option('-p, --players <string>', 'number of players')
  .parse(process.argv)

const opts = z
  .object({
    seed: z.string().optional(),
    players: z
      .string()
      .regex(/^\d+$/)
      .default('4')
      .transform((v) => Number.parseInt(v)),
  })
  .parse(program.opts())

main(opts).catch(console.error)
