var SassParser = require('./sass/sass-parser');

var sass = new SassParser({/* options */});

var css = sass.toCss('path/to/source.sass');


