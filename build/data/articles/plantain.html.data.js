({
  // The name of the template file for this type of data
  // In this case we are just copying the template to the
  // target directory unchanged.
  template: 'article.template.html',
  articleSubject: 'Plantain',
  articleText: `Plantain Article Text`,

  relatedHerbRecipeOptions: [ 'optionTextList', [ 'Model' ] ],

  relatedHerbPropertyOptions: [ 'optionTextList',
      [
        'Model'
        // note that you can place a ()s into the option
        // that will be ignored.
        // 'emetic (bark)',
        // thus the above string will convert to the following filename
        // emetic.html
      ]
    ],

    relateHerbAilmentOptions: [ 'optionTextList', [ 'Model'] ],

    relateHerbResourceOptions: [ 'optionTextList', [ 'Model'] ],
});