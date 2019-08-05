require('dotenv').config({ path: '../.env' });
const MovieDB = require('moviedb-promise');
const _ = require('lodash');
const movieDB = new MovieDB(process.env.MOVIE_API_KEY, useDefaultLimits = false);
const fs = require('fs');
const { promisify } = require('util');
const pWriteFile = promisify(fs.writeFile);
const pReadFile = promisify(fs.readFile);
const inputPath = `/Users/hyunsik/Developer/Mini-Projects/movie.viz/movie.viz.data`;


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

(async () => {
  const file = JSON.parse(await pReadFile(`${inputPath}/movieList.json`));
  const movieInfo = async id => await movieDB.movieInfo({ id });
  const movieCredits = async id => await movieDB.movieCredits({ id });
  const movieKeywords = async id => await movieDB.movieKeywords({ id });
  let movies = [];
  // const subFile = file.slice(startIdx, endIdx);
  const subFile = file;
  for (let [idx, datum] of subFile.entries()) {
    setTimeout(async () => {
      let id = datum.MovieID;
      let promises = [movieInfo(id), movieCredits(id), movieKeywords(id)];
      await Promise.all(promises).then(val => {
        let d = _.pick(_.merge({}, ...val), _.keys(model));
        d.genres = _.map(d.genres, genre => genre.name);
        d.cast = _.chain(d.cast)
            .map(cast => ({ pID: cast.id, character: cast.character, order: cast.order }))
            .filter(cast => !(cast.character.includes('(uncredited)') || cast.character.includes('(unconfirmed)')))
            .value();
        d.keywords = _.map(d.keywords, keyword => keyword.name);
        d.year = datum.Year;
        d.rank = datum.Rank;
        movies.push(d);
      }).catch(err => console.log(idx, datum, err));
      if (idx % 100 === 0) console.log(idx);
      if (idx === subFile.length - 1) {
        await pWriteFile(`${inputPath}/movies_short.json`, JSON.stringify(movies));
        await pWriteFile(`${inputPath}/movies_long.json`, JSON.stringify(movies, null, 2));
      }
    }, 2 * 1000 * idx);
  }
})().catch(err => console.log(err));


// MovieDB.personInfo({id: 190}, (err, res) => {
//   console.log(res);
//   // id
//   // birthday
//   // known_for_department
// });

// MovieDB.find({ external_source: 'imdb_id', id: 'nm0000142' }, (err, res) => {
//   console.log(res.person_results);
//   console.log(res.person_results[0].known_for);
// });
