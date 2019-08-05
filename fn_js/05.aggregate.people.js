require('dotenv').config({path: '../.env'});
const MovieDB = require('moviedb-promise');
const movieDB = new MovieDB(process.env.MOVIE_API_KEY, useDefaultLimits = false);
const R = require('ramda');
const fs = require('fs');
const {promisify} = require('util');
const pReadFile = promisify(fs.readFile);
const pReaddir = promisify(fs.readdir);
const pWriteFile = promisify(fs.writeFile);
const inputPath = `/Users/hyunsik/Developer/Mini-Projects/movie.viz/movie.viz.data`;


const readDir = path => pReaddir(path);
const filterErrorFiles = files => R.filter(file => file.includes('people_short'), files);
const readJSON = (path, file) => pReadFile(`${path}/${file}`);

const getFile = datum => readJSON(inputPath, datum)
    .then(d => JSON.parse(d.toString()));

const mapFile = files => R.map(datum => getFile(datum))(files);


readDir(inputPath)
    .then(d => filterErrorFiles(d))
    .then(d => mapFile(d))
    .then(d => Promise.all(d))
    .then(d => R.mergeAll(d))
.then(d => pWriteFile(`${inputPath}/people_short.json`, JSON.stringify(d)));

