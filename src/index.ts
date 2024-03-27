import { main } from './main.ts'
import { Command } from 'commander'
import { z } from 'zod'

const program = new Command()
  .name('tiny-sevens')
  .description('Tiny Sevens game')
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
