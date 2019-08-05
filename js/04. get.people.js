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

const chunkIndex = 0; // 0 다

(async () => {
  const peopleList = JSON.parse(await pReadFile(`${inputPath}/peopleList.json`));
  const personInfo = async id => await movieDB.personInfo({ id });
  let people = {};
  let errorLog = [];
  const chunk = _.chunk(peopleList, 20);
  const chunks = _.chunk(chunk, 1000);
  console.log(chunks.length);
  const subFile = chunks[chunkIndex];
  for (let [idx, datum] of subFile.entries()) {
    setTimeout(async () => {
      let promises = _.map(datum, e => personInfo(e));
      await Promise.all(promises).then(val => {
        _.forEach(val, e => {
          let p = _.pick(e, _.keys(model));
          people[p.id] = p;
        });
      }).catch(e => {
        errorLog.push(datum);
        console.log(`Error: ${datum}`)
      });
      if (idx % 50 === 0) console.log(`idx: ${idx}`);
      if (idx === subFile.length - 1) {
        await pWriteFile(`${inputPath}/people_errorLog_${chunkIndex}.json`, JSON.stringify(errorLog, null, 2));
        await pWriteFile(`${inputPath}/people_short_${chunkIndex}.json`, JSON.stringify(people));
        await pWriteFile(`${inputPath}/people_long_${chunkIndex}.json`, JSON.stringify(people, null, 2));
      }
    }, 11 * 1000 * idx);
  }


})().catch(err => console.log(err));


