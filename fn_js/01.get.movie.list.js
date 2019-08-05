const R = require('ramda');
const rp = require('request-promise');
const outputPath = `/Users/hyunsik/Developer/Mini-Projects/movie.viz/movie.viz.data`;
const cheerio = require('cheerio');
const fs = require('fs');
const getLink = (year, page) => ({
    link: `https://www.themoviedb.org/discover/movie?language=us&list_style=1&media_type=movie&page=${page}&primary_release_year=${year}&sort_by=popularity.desc&vote_count.gte=0`,
    year, page
});

const links = R.flatten(R.range(1919, 2019).map(i => R.range(1, 6).map(j => getLink(i, j))));

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const process = index => sleep(index * 2 * 1000)
    .then(() => makeRequest(links[index]))
    .then((data) => processData(data, links[index]))
    .catch(err => console.log(err));

const makeRequest = linkObj => rp(linkObj.link);

const mapIndexed = R.addIndex(R.map);

const processData = (data, linkObj) => {
    console.log(`ProcessData: ${linkObj.year}, ${linkObj.page}`);
    const $ = cheerio.load(data);
    let list = $('.results_poster_card .poster.card .info .flex a');
    let arr = [];
    mapIndexed((idx0, val) => arr.push({
        MovieID: $(val).attr('id').replace('movie_', ''),
        Year: linkObj.year,
        Rank: ((linkObj.page - 1) % 5) * list.length + idx0 + 1
    }), list);
    return arr;
};

Promise.all(R.range(0, links.length).map(i => process(i))).then(d => fs.writeFileSync(`${outputPath}/movieList_.json`, JSON.stringify(R.flatten(d),null,2)));