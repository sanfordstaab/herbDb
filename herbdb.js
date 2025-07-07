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

function openWindowThing(selId, type) {
  window.open(
    termToURL(
      ge(selId).value, 
      type
    ), 
    'home' // target
  );
}

function eh_openHerbArticle() {
  openWindowThing('selHerbs', 'article');
}

function eh_goToPropHerb() {
  openWindowThing('selHerbsWithProp', 'article');
}

function eh_openHerbProperty(event) {
  openWindowThing('selHerbProps', 'property');
}

function eh_openHerbGlossary(event) {
  openWindowThing('selGlossary', 'definition');
}

function selHerbsWithRecipe(event) {
  openWindowThing('selHerbsWithRecipe', 'recipe');
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