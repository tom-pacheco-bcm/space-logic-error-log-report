import typescript from 'rollup-plugin-typescript2';
import { readFileSync } from "fs"

const project = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `// space-logic-error-log-report
// version: ${project.version}
// date: ${(new Date()).toLocaleString()}
// author: tom pacheco
//
`

const footer = `
errorLogApp()
`

export default {
    input: './src/app.ts',
    plugins: [
        typescript(),
    ],
    output: {
        file: 'build/app.js',
        format: 'iife',
        name: 'errorLogApp',
        banner,
        footer,
    },
}