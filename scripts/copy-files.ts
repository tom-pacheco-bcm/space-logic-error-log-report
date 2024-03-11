"use strict";

import fs from "fs"
import path from "path"


function copyfile(src: string, dest: string) {

    if (fs.existsSync(dest) && fs.statSync(dest).isDirectory()) {
        dest = dest + path.basename(src);
    }
    fs.writeFileSync(dest, fs.readFileSync(src));
}


export function copyFiles(src: string | string[], dest: string | string[]) {

    if (Array.isArray(src) && Array.isArray(dest)) {
        if (src.length !== dest.length) throw new Error('size of arrays must match');
        for (let i = 0; i < src.length; i += 1)
            copyfile(src[i], dest[i])
        return;
    }
    if (Array.isArray(src)) {
        if (!fs.statSync(dest as string).isDirectory()) throw new Error('dest must be dir or array if source is an array');
        src.forEach(f => copyfile(f, dest as string))
        return;
    }

    if (Array.isArray(dest)) {
        dest.forEach(f => copyfile(src, f))
        return;
    }

    copyfile(src, dest)
}
