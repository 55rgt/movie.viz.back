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

const model = {
    birthday: null, // birthday => birth
    known_for_department: null,
    deathday: null, // deathday => death
    id: null, // id => pID
    name: null,
    gender: null,
    biography: null,
    popularity: null,
    profile_path: null
};

const readDir = path => pReaddir(path);
const filterErrorFiles = files => R.filter(file => file.includes('error'), files);
const readJSON = (path, file) => pReadFile(`${path}/${file}`);
const personInfo = id => new Promise(resolve => resolve(movieDB.personInfo({id})));

const mapIndexed = R.addIndex(R.map);

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const getFile = datum => readJSON(inputPath, datum)
    .then(d => JSON.parse(d.toString()))
    .then(d => R.flatten(d));

const mapFile = files => R.map(datum => getFile(datum))(files);

const extractInfo = datum => R.pick(R.keys(model), datum);

const run = list => mapIndexed((id, idx) => sleep(idx * 2 * 1000)
    .then(() => personInfo(id))
    .then((datum) => extractInfo(datum))
    .catch(e => console.log(id))
)(list);

const reduce = data => R.reduce((result, datum) => {
    if(!R.isNil(datum)) result[datum.id] = datum;
    return result;
}, {}, data);

readDir(inputPath)
    .then(d => filterErrorFiles(d))
    .then(d => mapFile(d))
    .then(d => Promise.all(d))
    .then(d => R.flatten(d))
    // .then(d => console.log(d.length))
    .then(d => run(d))
    .then(d => Promise.all(d))
    .then(d => reduce(d))
    .then(d => pWriteFile(`${inputPath}/people_long_errors.json`, JSON.stringify(d, null, 2)));