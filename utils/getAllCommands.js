"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCommandfiles = getAllCommandfiles;
var fs_1 = require("fs");
var path_1 = require("path");
function getAllCommandfiles(dir) {
    var entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap(function (entry) {
        var fullPath = path_1.default.join(dir, entry.name);
        return entry.isDirectory() ? getAllCommandfiles(fullPath) : [fullPath];
    }).filter(function (file) { return file.endsWith('.ts') || file.endsWith('.js'); });
}
