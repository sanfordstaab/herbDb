// herbdb.js

const symbols = {
  degree: '&deg;'
}

function onHomePageLoad() {
  window.name = 'home';
  // generateAllPropertyFiles();
}

/**
 * This converts a text string like 'emetic (bark)' to 'emetic.html'
 * @param {string} term to start URL with
 * @param {string} type: article, property, definition ...
 * @param {string} root: usually '' or '../'
 * @returns 
 */
function termToURL(term, type, root='') {
  return `${root}${type}s/${
      term.toLowerCase().
        replace(/\s*\(.*\)\s*/g, ' '). // ()s can be used to annotate the text but not effect the target url.
        replace(/,/g, ''). // commas are allowed but don't effect the target url
        replace(/^\s+/, ''). // remove spaces at the beginning
        replace(/\s+$/, ''). // remove spaces at the end
        replace(/ /g, '_') // _s replace spaces in the target url
    }.html`;
}

/**
 * Used to get to the URL to links within detail pages.
 * gu stands for "go to url".
 * This puts the calculation into one place making movement
 * of files easier if we need to and enforces consistency.
 * This event handler is meant to be called from an anchor 
 * element like this:
 * <a href="" onclick="return gu('emetic', 'property', '');">
 * This also works for selecting a target term from a select
 * control of text terms.
 * <button onclick="return gu('selId', 'property', '');">
 * @param {string} term to start URL with or the id of a select control
 * @param {string} type: article, property, definition ...
 * @param {string=} root: usually '' or '../' by default
 */
function gu(term, type, root='../') {
  const elSel = ge(term);
  if (elSel) {
    term = elSel.value;
  }
  const myOpenUrl = termToURL(term, type, root);
  window.open(myOpenUrl, '_self');
  return false; // prevent default href use
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