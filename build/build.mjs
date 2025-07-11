// build.js

import fs from 'fs';
import path from 'path';
const _dirname = import.meta.dirname;
const dataBasePath = path.normalize(_dirname + '/data');
const templateBasePath = path.normalize(_dirname + '/templates');
const targetBasePath = path.normalize(_dirname + '/../public');

// read the main.data file first
const sMainData = fs.readFileSync(dataBasePath + '/main.data.js').toString();
const aAllFilesInOrder = eval(sMainData).allFilesInOrder;

// for each file path, relative to the target and 
// data directories, listed in main.data.js...
for (const filePath of aAllFilesInOrder) {
  if (filePath.trim().indexOf('//') == 0) {
    // skip comment lines
    continue;
  }
  const dataFilePath = `${dataBasePath}/${filePath + '.data.js'}`;
  if (!fs.existsSync(dataFilePath)) {
    console.warn(`The file: "${
        path.basename(dataFilePath)
      }" does not exist.
      "${
        path.basename(filePath)
      }" will not be built.`)
    continue;
  }
  let data = fs.readFileSync(dataFilePath).toString();
  try {
    data = eval(data);
  } catch (e) {
    console.warn(`Error reading ${dataFilePath}: ${e.message}`);
    break;
  }

  const templateFilePath = `${templateBasePath}/${data.template}`;
  if (!fs.existsSync(templateFilePath)) {
    console.warn(`The file ${templateFilePath} does not exist. ${filePath} will not be built.`)
    console.error('Build failed');
  }
  let templateData = fs.readFileSync(templateFilePath).toString();
  
  // substitute data values into templateData
  let outputData = templateData;
  for (const key in data) {
    if (key == 'template') continue;
    outputData = outputData.replace(new RegExp(`%${key}%`, 'gm'), data[key]);
  }
  
  const targetFilePath = `${targetBasePath}/${filePath}`;
  fs.writeFileSync(targetFilePath, outputData);
  console.log(`Built ${path.basename(targetFilePath)}`)
}