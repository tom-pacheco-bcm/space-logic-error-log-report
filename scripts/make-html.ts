"use strict";

import fs from "fs"

interface TgmlOptions {
    dest: string
    src: string
    css: string
    name: string
    template: string
    appendVersion: boolean
    version: string
    description: string
}

const ext = ".html"

export function makeHtml(options: TgmlOptions) {

    let template = fs.readFileSync(options.template, 'utf8');

    var script = fs.readFileSync(options.src, 'utf8');
    var style = fs.readFileSync(options.css, 'utf8');

    const styleElement = `    <style>
${style}
    </style>
    `
    const scriptElement = `    <script>
    ${script}
    </script>
  <div class="footer">
    <div id="version">${options.description}</div>
    <div id="copyright">by BCM Controls</div>
  </div>
`
    template = template.replace(/(?=<\/head>)/, styleElement)
    template = template.replace(/(?=<\/body>)/, scriptElement)

    if (options.appendVersion) {
        fs.writeFileSync(options.dest + '/' + options.name + '-' + options.version + ext, template);
    }

    fs.writeFileSync(options.dest + '/' + options.name + ext, template);
}



