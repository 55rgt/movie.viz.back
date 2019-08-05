const fs = require('fs');
const R = require('ramda');
const { promisify } = require('util');
const pWriteFile = promisify(fs.writeFile);
const outputPath = `/Users/hyunsik/Developer/Mini-Projects/movie.viz/movie.viz.data`;
const _ = require('lodash');
const request = require('request');
const cheerio = require('cheerio');
const path = (year, page) => `https://www.themoviedb.org/discover/movie?language=us&list_style=1&media_type=movie&page=${page}&primary_release_year=${year}&sort_by=popularity.desc&vote_count.gte=0`;
const startYr = 1919;
const listJSON = [];
const eIdx = 100;

(async () => {
  for (let i = 0; i < eIdx; i++) {
    (() => {
      setTimeout(async () => {
        let year = startYr + Math.floor(i / 5);
        await request.get(path(year, i % 5 + 1), (err, res, data) => {
          // console.log(data);
          const $ = cheerio.load(data);
          let list = $('.results_poster_card .poster.card .info .flex a');
          // console.log(list);
          _.forEach(list, (element, index) => {
            // console.log(element);
            listJSON.push({
              MovieID: $(element).attr('id').replace('movie_', ''),
              Rank: (i % 5) * 20 + index + 1,
              Year: year
            });
          });
          console.log(listJSON);
         // console.log(i);
          if(i === eIdx - 1) {
           // await pWriteFile(`${outputPath}/movieList_${eIdx}.json`, JSON.stringify(listJSON, null, 2));
           // await pWriteFile(`${outputPath}/movieList_${eIdx}_short.json`, JSON.stringify(listJSON));
          }
        });
      },  2 * 1000 * i);
    })(i);
  }
})().catch(error => console.log(error));
