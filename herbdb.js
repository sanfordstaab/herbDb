// herbdb.js

const symbols = {
  degree: '&deg;'
}

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
      term.toLowerCase().replace(/,/g, '').replace(/ /g, '_')
    }.html`;
}

/**
 * Used to get to the URL to links within detail pages.
 * gu stands for "go to url".
 * This puts the calculation into one place making movement
 * of files easier if we need to and enforces consistency.
 * This event handler is meant to be called from an anchor 
 * element like this:
 * <a href="" onclick="return gu('emetic', 'property', '../');">
 * @param {string} term to start URL with
 * @param {string} type: article, property, definition ...
 * @param {string=} root: usually '' or '../'
 */
function gu(term, type, root='../') {
  const myOpenUrl = termToURL(term, type, root);
  window.open(myOpenUrl, '_self');
  return false; // prevent default href use
}

function eh_openHerbArticle(root='../') {
  return gu(ge('selHerbs').value, 'article', root);
}

function eh_goToPropHerb(root='../') {
   return gu(ge('selHerbsWithProp').value, 'article', root);
}

function eh_goToRecipeHerb(root='../') {
   return gu(ge('selHerbsWithRecipe').value, 'article', root);
}

function eh_openHerbProperty(root='../') {
  return  gu(ge('selHerbProps').value, 'property', root);
}

function eh_openHerbGlossary(root='../') {
  return gu(ge('selGlossary').value, 'definition', root);
}

function selHerbsWithRecipe(root='../') {
   return gu(ge('selHerbsWithRecipe').value, 'recipe', root);
}

function eh_openHerbRecipe(root='../') {
  return gu(ge('selRecipes').value, 'recipe', root);
}

function eh_openHerbAilment(root='../') {
  return gu(ge('selAilments').value, 'ailment', root);
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