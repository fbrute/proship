// File sql.js
// Organize an sql provider
//
const QueryFile = require('pg-promise').QueryFile;
const path = require('sql');

// Helper for linking to external query files:
function sql(file) {
    const fullPath = path.join(__dirname, file); // generating full path;
    return new QueryFile(fullPath, {minify: true});
}

module.exports = {
    // external queries for Users:
    shipments: sql('shipments.sql'),
};

