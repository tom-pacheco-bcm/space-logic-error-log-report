"use strict";

import { makeHtml as makeHtml } from "./make-html.js"
import { readJson } from "./read-json.js"

const minFile = "./build/app.min.js"
const cssFile = "./src/app.css"

const pkg = readJson('./package.json');

const tgml_options = {
    dest: 'build/',
    template: './src/template.html',
    appendVersion: true,
    name: pkg.name,
    version: pkg.version,
    description: pkg.description + ' - Version:' + pkg.version + ' - Date:' + (new Date()).toDateString(),
    src: minFile,
    css: cssFile,
};

makeHtml(tgml_options);
