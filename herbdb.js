// herbdb.js

function termToURL(term, type) {
  return `${
    term.toLowerCase().replace(/ /g, '_')
   }_${
    type
   }.html`;
}

function eh_onHerbArticleChanged(event) {
  window.open(termToURL(event.target.value, 'article'), 'article');
}

function eh_onHerbPropChanged(event) {
  window.open(termToURL(event.target.value, 'property'), 'property');
}