// utils.js

function ge(id) {
  return document.getElementById(id);
}

/**
 * @param {string} parameterName 
 * @returns value of URL paramName where the url is the current location
 */
function getParamFromURL(parameterName) {
  let result = '';
  let tmp = [];
  const items = location.search.substring(1).split("&");
  for (let index = 0; index < items.length; index++) {
    tmp = items[index].split("=");
    if (tmp[0].toLowerCase() === parameterName.toLowerCase()) {
      result = decodeURIComponent(tmp[1]);
      break;
    }
  }
  return result;
}