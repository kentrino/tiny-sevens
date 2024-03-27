import * as readline from "node:readline"

export async function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise<string>((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}
