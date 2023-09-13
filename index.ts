import chalk from 'chalk'
import figlet from 'figlet'
import readline from 'readline'
import fs from 'fs'
import path from 'path'
import { TestMetadata, Test } from './tests/_types'

console.clear()

console.log(
    chalk.magenta(figlet.textSync('Bun Testing Oven', { font: "Fire Font-s" })),
    chalk.cyan("\n-------------------------------------------------------------------------"),
    "\n"
)

const iface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const runningTests: Test[] = []
let isFirstRun = true

function randomString(length: number): string {
    const numbers = "0123456789"

    return Array.from({ length }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('')
}

function showOptions(): void {
    console.log(chalk.green("Available tests:"))

    fs.readdir('./tests', (err, files) => {
        if (err) return console.log(chalk.red("Error: " + err))

        const testArray: Test[] = []

        files.forEach(file => {
            if (file == '_types.ts') return
            const data: TestMetadata = { name: file.replace('.ts', '') }

            testArray.push({
                id: testArray.length + 1,
                ...data
            })

            const colour = testArray.length % 2 == 0 ? chalk.cyan : chalk.blue

            console.log(colour(`[${testArray.length}] ${data.name}`))
        })

        iface.question(chalk.green("\nWhich test would you like to run? "), (answer) => {
            const test = testArray[parseInt(answer) - 1]

            if (!test) {
                console.log(chalk.red("Invalid test number!"))
                return showOptions()
            }

            const testID = randomString(6)

            console.clear()
            console.log(chalk.yellow(`\nRunning test ${test.id}: ${test.name} with ID ${testID}`))
            if (isFirstRun) console.log(chalk.red("You can cancel the test at any time by entering q\n"))
            isFirstRun = false

            const workerURL = new URL(path.join(__dirname, 'tests', test.name), import.meta.url)
            const worker = new Worker(workerURL)

            runningTests.push({
                ...test,
                activeID: testID.toString(),
                worker
            })
        })
    })
}

showOptions()

iface.on('line', (input) => {
    if (input == 'q' || input == 'quit') {
        console.clear()
        console.log(chalk.dim("\n----------\n" + runningTests.map(t => `[${t.activeID}]: ${t.name}`).join("\n") + "\n----------"))

        iface.question(`${chalk.green("\nWhich test would you like to cancel? ")}`, (answer) => {
            const test = runningTests.find(t => t?.activeID == answer)

            if (!test) {
                console.log(chalk.red("Invalid active test ID\n"))
                return
            }

            test.worker?.terminate()
            runningTests.splice(runningTests.indexOf(test), 1)

            console.log(chalk.red(`Terminated test.\n`))
        })
    } else if (input == 'c' || input == 'clear') {
        console.clear()
        console.log(chalk.yellow("Type h for help\n"))
    } else if (input == "t" || input == "test") {
        console.clear()
        showOptions()
    } else if (input == "l" || input == "ls" || input == "la" || input == "list") {
        console.log(chalk.dim("\n----------"))
        let lastColour = chalk.cyan

        runningTests.forEach(t => {
            lastColour = lastColour == chalk.cyan ? chalk.blue : chalk.cyan

            console.log(lastColour(`[${t.activeID}]: ${t.name}`))
        })

        console.log(chalk.dim("----------\n"))
    } else if (input == "h" || input == "help") {
        console.log(chalk.dim("\n----------"))
        console.log(chalk.cyan("q/quit") + " - Cancel a running test")
        console.log(chalk.cyan("c/clear") + " - Clear the console")
        console.log(chalk.cyan("t/test") + " - Run a test")
        console.log(chalk.cyan("l/ls/la/list") + " - List running tests")
        console.log(chalk.dim("----------\n"))
    }
})