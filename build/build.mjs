// build.js

import fs from 'fs';
import path from 'path';

// for debuging and adding lots of data set this to false.
const fBuildAllFilesOnError = false; 

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

  // skip any comment lines in sMainData
  if (filePath.trim().indexOf('//') == 0) {
    continue;
  }

  // find and load the sData object from the data file
  const dataFilePath = `${dataBasePath}/${filePath + '.data.js'}`;
  if (!fs.existsSync(dataFilePath)) {
    console.warn(`The file: "${
        getContextBasePath(dataFilePath)
      }" does not exist.
      "${
        getContextBasePath(filePath)
      }" will not be built.`)
    if (fBuildAllFilesOnError) continue; else break;
  }
  let sData = fs.readFileSync(dataFilePath).toString();
  let oData = null;

  // parse sData string to oData
  try {
    oData = eval(sData);
  } catch (e) {
    console.warn(`!!! Parse error: ${dataFilePath}: ${e.message}
      Skipping this file.`);
    if (fBuildAllFilesOnError) continue; else break;
  }

  if (!oData.template) {
    console.warn(`!!! The data file ${
        getContextBasePath(dataFilePath)
      } does not have the required template key defined.
      Skipping this file.`);
    if (fBuildAllFilesOnError) continue; else break;
  }
  
  // find and load the sTemplateData object
  const templateFilePath = `${templateBasePath}/${oData.template}`;
  if (!fs.existsSync(templateFilePath)) {
    console.warn(`!!! Error: file  ${
        getContextBasePath(templateFilePath, 'templates')
      }, referenced by the "template" key in the ${
        filePath
      } file, does not exist. 
      ${filePath} will not be built.`)
    if (fBuildAllFilesOnError) continue; else break;
  }
  // read the template file
  let sTemplate = fs.readFileSync(templateFilePath).toString();
  
  // substitute oData values or do operations on sTemplate.
  // for each key of the oData object...
  for (const key in oData) {

    // skip the template key as we have already parsed that.
    if (key == 'template') {
      continue;
    }

    if (typeof(oData[key]) == 'string') {
      // straight and simple substitution
      sTemplate = sTemplate.replace(new RegExp(`%${key}%`, 'gm'), oData[key]);
      continue; // next key please
    
    } else if (Array.isArray(oData[key])) {
      // key: [ operation, value(s) ]
      const operation = oData[key][0];

      switch (operation) {

        case 'optionTextList':
          sTemplate = doOptionTextList(oData, key, dataFilePath, sTemplate);
          break;

        case 'allOptionsOfType':
          sTemplate = doAllOptionsOfType(oData, key, dataFilePath, sTemplate);
          break;

        default:
          console.warn(`!!! Syntax error in ${
              getContextBasePath(dataFilePath)
            }.
            Unrecognized operation '${operation}'.`);
          break;

      } // switch oData[key][0]

    } // opValue is an Array
  } // for each key

  if (!sTemplate) {
    if (fBuildAllFilesOnError) continue; else break;
  } else {
    // write the built file
    const targetFilePath = `${targetBasePath}/${filePath}`;
    fs.writeFileSync(targetFilePath, sTemplate);
    if (fBuildAllFilesOnError) {
      console.log(`${
          getContextBasePath(targetFilePath, 'public')
        } built ok.`)
    }
  }

} // for each data file

/**
 * This checks syntax when an array of strings is expected
 * as the second parameter of a 2 member array key value.
 * This also check that the value array has two members.
 * @param {object} oData 
 * @param {string} key 
 * @param {string} dataFilePath 
 * @returns {boolean} fError
 */
function opValueArrayChecks(oData, key, dataFilePath) {
  // make sure the oData[key] is an Array of 2 items.
  const opValue = oData[key][1];
  if (!Array.isArray(opValue)) {
  console.warn(`!!! Syntax error in ${
      getContextBasePath(dataFilePath)
    } for key ${
      key
    }.
        ${
      oData[key]
    } 
    The value for the second value part should be an array of text values.
    Instead it is of type ${typeof(opValue)}.`);
   return true;
  }

  let sOptions = '';
  if (undefined == opValue) {
    console.warn(`!!! Syntax error in ${
        getContextBasePath(dataFilePath)
      } for key ${
        key
      }.
      >>> ${
        oData[key]
      } 
      is missing the second part of the value.`);
    return true;
  }
  if (!Array.isArray(opValue)) {
    console.warn(`!!! Syntax error in ${
        getContextBasePath(dataFilePath)
      } for key ${
        key
      }.
      >>> ${
        oData[key]
      } 
      The second part of the value is not an Array but of type ${
        typeof(oData[key[1]])
      }.`);
    return true;
  }
  return false;
}

/**
 * does simple checks on the opValue
 * @param {object} oData 
 * @param {string} key 
 * @param {string} dataFilePath 
 * @returns {boolean} fError
 */
function keyValuechecks(oData, key, dataFilePath) {
  const opValue = oData[key];
  if (!opValue) {
    console.warn(`!!! No value found for key ${key} in ${getContextBasePath(dataFilePath)}!
      File will be skipped.`)
    return true;
  }
  return false;
}

function fileNameToOption(fName) {
  const text = fName.substring(0, fName.indexOf('.')).replace(/^./, fName.substring(0, 1).toUpperCase()).
    replace(/_/g, ' ');
  return `<option>${text}</option>`;
}

function getContextBasePath(fullPath, ancestorDir='data') {
  return fullPath.substring(fullPath.indexOf(ancestorDir));
}

/**
  Given a template text list this:

    <select>
      %myOptions%
    </select>

  and a data line like this:

    myOptions: [ 'optionTextList', [ 'foo', 'bar', 'other' ] ]

  will produce an output like this:

    <select>
      <option>bar</option>
      <option>foo</option>
      <option>other</option>
    </select>

  Note that the items will be sorted alphabetically!
 
  @Param {object} oData: JSON object from the data file.
  @Param {string} key: the key into oData of the currently being processed
    oData[key] would be the value for this key.
  @Param dataFilePath: the full path of the current data file (for errors)
  @Param {string} sTemplate: The current state of the template being processed.
  @return {string} sTemplate modified by this function. 
  '' means error.
 */
function doOptionTextList(oData, key, dataFilePath, sTemplate) {
  // substitute value(s) after wrapping them in option tags.
  // sort them alphabetically
  
  if (keyValuechecks(oData, key, dataFilePath) ||
      opValueArrayChecks(oData, key, dataFilePath)) {
    return '';
  }

  const opValue = oData[key][1];

  // go through the option list and turn the text into an HTML option.
  let sOptions = '';
  for (const sText of opValue) {

    // expect opValue to be an array of stirngs.
    if (typeof(sText) != 'string') {
      console.warn(`!!! Syntax error in ${
          getContextBasePath(dataFilePath)
        } for key ${
          key
        }.
            ${
          oData[key]
        } 
        All values in the second value part array should be strings.
        [${
          JSON.stringify(sText)
        }] is not.`);
        fError = true;
    }

    // wrap the option text in <option> tags
    sOptions += `<option>${sText}</option>\n`
  }

  // insert the options list into the template
  return sTemplate.replace(new RegExp(`%${key}%`, 'gm'), sOptions);
}

/**
  Given a template text list this:

    <select>
      %allOptions%
    </select>

  and a data line like this:

    allOptions: [ 'allOptionsOfType', 'property' ]

  will produce an output like this:

    <select>
      <option>bar</option>
      <option>foo</option>
      <option>other</option>
    </select>

  where the options come from the existing 
  data/propertys/foo.html.data.js files.
  Note that the items will be sorted alphabetically!
 
  @Param {object} oData: JSON object from the data file.
  @Param {string} key: the key into oData of the currently being processed
    oData[key] would be the value for this key.
  @Param dataFilePath: the full path of the current data file (for errors)
  @Param {string} sTemplate: The current state of the template being processed.
  @return {string} sTemplate modified by this function. 
  '' means error.
 */
function doAllOptionsOfType(oData, key, dataFilePath, sTemplate) {
  if (keyValuechecks(oData, key, dataFilePath)) {
    return '';
  }
  
  const opValue = oData[key][1];

  // opValue should be a string
  if (typeof(opValue) != 'string') {
    console.warn(`!!! type value of "${
          opValue
        }" for 'allOptionsOfType' was not recognized for key ${
          key
        } of ${
          getContextBasePath(dataFilePath)
        }`);
    return '';
  }

  // check the value to ensure it is a proper type
  const typeBasePath = `${dataBasePath}/${opValue + 's'}`;
  if (!fs.existsSync(typeBasePath)) {
    console.warn(`!!! Unrecognized data type name "${opValue}" in the value for key ${key}.
      The file ${getContextBasePath(dataFilePath)} will be skipped.`)
    return '';
  }

  // find all the fileNames within the typeBasePath
  const aFileNames = [];
  for (const fName of fs.readdirSync(typeBasePath)) {
    // will also include directory names so skip those.
    if (fs.statSync(path.resolve(typeBasePath, fName)).isDirectory()) {
      continue;
    }
    // skip non-data.js files
    if (fName.lastIndexOf('.data.js') != fName.length - 8) {
      continue;
    }
    aFileNames.push(fileNameToOption(path.basename(fName)));
  };

  return sTemplate.replace(new RegExp(`%${key}%`, 'gm'), aFileNames.sort().join('\n'));
}