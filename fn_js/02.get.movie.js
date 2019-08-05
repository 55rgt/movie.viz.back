require('dotenv').config({path: '../.env'});
const MovieDB = require('moviedb-promise');
const movieDB = new MovieDB(process.env.MOVIE_API_KEY, useDefaultLimits = false);
const fs = require('fs');
const inputPath = `/Users/hyunsik/Developer/Mini-Projects/movie.viz/movie.viz.data`;
const R = require('ramda');

const model = {
    budget: null,
    genres: null,
    original_language: null,
    original_title: null,
    overview: null,
    popularity: null,
    poster_path: null,
    release_date: null,
    revenue: null,
    runtime: null,
    title: null,
    id: null,
    vote_average: null,
    vote_count: null,
    cast: null,
    keywords: null
};

const sleep = time => new Promise(resolve => setTimeout(resolve, time));
const readJSON = file => JSON.parse(fs.readFileSync(file).toString());

const movieInfo = id => new Promise(resolve => resolve(movieDB.movieInfo({id})));
const movieCredits = id => new Promise(resolve => resolve(movieDB.movieCredits({id})));
const movieKeywords = id => new Promise(resolve => resolve(movieDB.movieKeywords({id})));
const movieQuery = id => Promise.all([movieInfo(id), movieCredits(id), movieKeywords(id)]);

const extractInfo = (data, obj) => R.compose((datum) => {
    datum.year = obj.Year;
    datum.rank = obj.Rank;
    datum.genres = R.map(g => g.name, datum.genres);
    datum.keywords = R.map(k => k.name, datum.keywords);
    datum.cast = R.compose(
        R.filter(c => !(c.character.includes('(uncredited)') || c.character.includes('(unconfirmed)'))),
        R.map(c => ({ pID: c.id, character: c.character, order: c.order })))(datum.cast);
    return datum;
}, R.pick(R.keys(model)), R.mergeAll)(data);

const run = (index, datum) => sleep(index * 2 * 1000)
    .then(() => movieQuery(datum['MovieID']))
    .then(d => extractInfo(d, datum))
    .catch(e => console.error(e));


const mapIndexed = R.addIndex(R.map);


const getMovie = file => R.compose(mapIndexed((datum, idx) => run(idx, datum)), readJSON)(file);

Promise.all(getMovie(`${inputPath}/movieList.json`))
    .then(d => fs.writeFileSync(`${inputPath}/movies_long_.json`, JSON.stringify(d, null, 2)));


