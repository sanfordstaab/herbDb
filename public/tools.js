// tools.js

function generateAllPropertyFiles() {
  const aUrls = [];
  const selOpts = ge('selHerbProps').options;
  for (let option of selOpts) {
    aUrls.push(termToURL(option.value, 'property'));
  }
  console.log(JSON.stringify(aUrls));
}