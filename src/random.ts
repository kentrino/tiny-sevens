import { type PRNG, xor4096 } from "seedrandom"

let generator: PRNG | undefined = undefined

export function random(forceInitialize?: string): number {
  if (!generator) {
    generator = xor4096("SOME SEED")
  }
  if (!!forceInitialize) {
    generator = xor4096(forceInitialize)
  }
  return generator!.double()
}
