require('dotenv').config({ path: '../.env' });
const MovieDB = require('moviedb-promise');
const _ = require('lodash');
const fs = require('fs');
const { promisify } = require('util');
const pWriteFile = promisify(fs.writeFile);
const pReadFile = promisify(fs.readFile);
const inputPath = `/Users/hyunsik/Developer/Mini-Projects/movie.viz/movie.viz.data`;


(async () => {
  const file = JSON.parse(await pReadFile(`${inputPath}/movies_short.json`));
  let pIDs = [];

  for (let datum of file) {
    let casts = datum.cast;
    _.forEach(casts, cast => {
      if (!pIDs.includes(+cast.pID)) pIDs.push(+cast.pID);
    });
  }
  pIDs = pIDs.sort((a, b) => a - b);
  console.log(typeof pIDs[0]);
  console.log(pIDs.length);

  await pWriteFile(`${inputPath}/peopleList.json`, JSON.stringify(pIDs));


})().catch(err => console.log(err));


