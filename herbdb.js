// herbdb.js

function onHomePageLoad() {
  window.name = 'home';
  // generateAllPropertyFiles();
}

/**
 * 
 * @param {string} term to start URL with
 * @param {string} type: article, property, definition ...
 * @returns 
 */
function termToURL(term, type) {
  const url = `${
    term.toLowerCase().replace(/ /g, '_')
   }_${
    type
   }.html`;
  return url;
}

function eh_openHerbArticle() {
  window.open(
    termToURL(
      ge('selHerbs').value, 
      'article'
    ), 
    'home' // target
  );
}

function eh_openHerbProperty(event) {
  window.open(
    termToURL(
      ge('selHerbProps').value, 
      'property'
    ), 
    'home' // target
  );
}

function eh_openHerbGlossary(event) {
  window.open(
    termToURL(
      ge('selGlossary').value, 
      'definition'
    ), 
    'home' // target
  );
}

/**
 * Sets ge(targetId)[attr] = value of URL paramName
 * @param {string} targetId - element id to set attr 
 * @param {string} attr - like 'src' or 'innerText'
 * @param {string} paramName - URL parameter to get 
 *  value for setting into attr of the element.
 */
function setElementAttribute(targetId, attr, paramName) {
  const value = getParamFromURL(paramName);
  if (value) {
    ge(targetId)[attr] = value;
  }
}