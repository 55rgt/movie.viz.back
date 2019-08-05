require('dotenv').config({path: '../.env'});
const MovieDB = require('moviedb-promise');
const R = require('ramda');
const fs = require('fs');
const inputPath = `/Users/hyunsik/Developer/Mini-Projects/movie.viz/movie.viz.data`;

const readJSON = file => JSON.parse(fs.readFileSync(file).toString());

const modify = file => R.compose(R.sort((a, b) => a - b), R.uniq, R.map(d => +d.pID), R.chain(d => d.cast), readJSON)(file);

Promise.all(modify(`${inputPath}/movies_short.json`)).then(d => fs.writeFileSync(`${inputPath}/peopleList_.json`, JSON.stringify(d)));
