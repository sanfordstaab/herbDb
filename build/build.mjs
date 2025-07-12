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
  let sTemplateData = fs.readFileSync(templateFilePath).toString();
  
  // substitute oData values into sTemplateData
  let outputData = sTemplateData;
  let fError = false;

  // for each key of the oData object...
  for (const key in oData) {

    // skip the template key as we have already parsed that.
    if (key == 'template') {
      continue;
    }

    if (typeof(oData[key]) == 'string') {
      // straight substitution
      outputData = outputData.replace(new RegExp(`%${key}%`, 'gm'), oData[key]);
    } 

    else if (Array.isArray(oData[key])) {
      // The value can be an array which allows attaching one or more 
      // operations to instruct the buile process how to handle
      // the value.
      // key: [ operation, value(s) ]
      const operation = oData[key][0];
      const opValue = oData[key][1];

      switch (operation) {

        case 'optionTextList':
          // substitute value(s) after wrapping them in option tags.
          // sort them alphabetically
          
          fError = keyValuechecks(oData, key, dataFilePath);
          if (!fError) {
            fError = opValueArrayChecks(oData, key, dataFilePath);
          }
          if (fError) {
            break;
          }

          // go through the option list
          let sOptions = '';
          for (const sText of opValue) {
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
          outputData = outputData.replace(new RegExp(`%${key}%`, 'gm'), sOptions);
          break;

        case 'allOptionsOfType':
          fError = keyValuechecks(oData, key, dataFilePath);
          if (fError) {
            continue;
          }

          // opValue should be a string
          if (typeof(opValue) != 'string') {
            console.warn(`!!! type value of "${
                opValue
              }" was not recognized for key ${key} of ${getContextBasePath(dataFilePath)}
              This file will be skipped.`);
            fError = true;
            break;
          }

          // check the value to ensure it is a proper type
          const typeBasePath = `${dataBasePath}/${opValue + 's'}`;
          if (!fs.existsSync(typeBasePath)) {
            console.warn(`!!! Unrecognized data type name "${opValue}" in the value for key ${key}.
              The file ${getContextBasePath(dataFilePath)} will be skipped.`)
            fError = true;
            if (fBuildAllFilesOnError) continue; else break;
          }

          const aFileNames = [];
          // find all the fileNames within the typeBasePath
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
          outputData = outputData.replace(new RegExp(`%${key}%`, 'gm'), aFileNames.sort().join('\n'));
          break;

        default:
          console.warn(`!!! Syntax error in ${
              getContextBasePath(dataFilePath)
            }.
            The operation value part [${operation}] is unrecogniced.`);
            fError = true;
          break;

      } // switch oData[key][0]

    } // opValue is an Array
    else {
      console.warn(`!!! Syntax error in ${
          getContextBasePath(dataFilePath)
        } for key ${
          key
        }. 
        The second part of the second value is of type ${
          typeof(opValue)
        } but an array was expected.`);
    } // type check if for second part of second value

    if (fError) {
     break; // go on to next key
    }
  } // for each key

  if (fError) {
    console.warn(`!!! Failed to build ${path.basename(targetFilePath)}`);
    break;  // stop build
  } else {
    const targetFilePath = `${targetBasePath}/${filePath}`;
    fs.writeFileSync(targetFilePath, outputData);
    console.log(`Built ${path.basename(targetFilePath)}`)
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
 * @returns 
 */
function keyValuechecks(oData, key, dataFilePath) {
  let fError = false;
  const opValue = oData[key];
  if (!opValue) {
    console.warn(`!!! No value found for key ${key} in ${getContextBasePath(dataFilePath)}!
      File will be skipped.`)
    fError = true;
  }
  return fError;
}

function fileNameToOption(fName) {
  const text = fName.substring(0, fName.indexOf('.')).replace(/^./, fName.substring(0, 1).toUpperCase()).
    replace(/_/g, ' ');
  return `<option>${text}</option>`;
}

function getContextBasePath(fullPath, ancestorDir='data') {
  return fullPath.substring(fullPath.indexOf(ancestorDir));
}