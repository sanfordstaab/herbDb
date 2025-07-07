// herbdb.js

function onHomePageLoad() {
  window.name = 'home';
  // generateAllPropertyFiles();
}

/**
 * 
 * @param {string} term to start URL with
 * @param {string} type: article, property, definition ...
 * @param {string} root: usually '' or '../'
 * @returns 
 */
function termToURL(term, type, root='') {
  return `${root}${type}s/${
      term.toLowerCase().replace(/ /g, '_')
    }.html`;
}

/**
 * Used to get to the URL to links within detail pages.
 * This puts the calculation into one place making movement
 * of files easier if we need to.
 * Meant to be called from an anchor element like this:
 * <a href="" onclick="return eh_gurl('emetic', 'property', '../');">
 * @param {string} term to start URL with
 * @param {string} type: article, property, definition ...
 * @param {string=} root: usually '' or '../'
 */
function eh_gurl(term, type, root='../') {
  const openUrl = termToURL(term, type, root);
  window.open(openUrl, '_self');
  return false; // prevent default href use
}

function eh_openHerbArticle(root='../') {
  return eh_gurl(ge('selHerbs').value, 'article', root);
}

function eh_goToPropHerb(root='../') {
   return eh_gurl(ge('selHerbsWithProp').value, 'article', root);
}

function eh_openHerbProperty(root='../') {
  return  eh_gurl(ge('selHerbProps').value, 'property', root);
}

function eh_openHerbGlossary(root='../') {
  return eh_gurl(ge('selGlossary').value, 'definition', root);
}

function selHerbsWithRecipe(root='../') {
   return eh_gurl(ge('selHerbsWithRecipe').value, 'recipe', root);
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