// The DBMS notes. Every section is a Markdown file in ./dbms/ (one file per section, named after the section id), in reading
// order by their `next` links. See markdownSections.js for the file format and docs/content/NOTES_TEMPLATE.md for the rules.
const path = require('path');
const { loadMarkdownSections, orderByNext } = require('./markdownSections');

module.exports = {
  subject: 'Database Management Systems',
  sections: orderByNext(loadMarkdownSections(path.join(__dirname, 'dbms'))),
};
