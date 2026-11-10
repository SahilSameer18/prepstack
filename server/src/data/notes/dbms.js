// The DBMS notes. Sections that have been rewritten are Markdown files in ./dbms/ (one file per section, named after the
// section id). Sections that have not been rewritten yet are still in dbms.legacy.js. A Markdown file replaces the legacy
// section with the same id. See markdownSections.js for the file format.
const path = require('path');
const legacy = require('./dbms.legacy');
const { withMarkdownSections } = require('./markdownSections');

module.exports = withMarkdownSections(legacy, path.join(__dirname, 'dbms'));
