// The Object Oriented Programming notes. Every section is a Markdown file in ./oops/ (one file per section, named after the section id), in reading
// order by their `next` links. See markdownSections.js for the file format and docs/content/NOTES_TEMPLATE.md for the rules.
const path = require('path');
const { loadMarkdownSections, orderByNext } = require('./markdownSections');

module.exports = {
  subject: 'Object Oriented Programming',
  sections: orderByNext(loadMarkdownSections(path.join(__dirname, 'oops'))),
};
