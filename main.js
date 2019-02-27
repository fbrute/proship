'use strict';

const promise = require('bluebird');
const initOptions = {
  promiseLib: promise, // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(initOptions);

// Database connection details;
const cn = {
  host: 'localhost', // 'localhost' is the default;
  port: 5432, // 5432 is the default;
  database: 'shipup',
  user: 'root',
};

const db = pgp(cn); // database instance;

var express = require('express');
var morgan = require('morgan');
var port = 3000;
var hostname = 'localhost';
var bodyParser = require('body-parser');

var app = express();

// var regRouter = express.Router();
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/api/v1/shipments', function(req, response, next) {
  // parsing the request parameters
  var query_parameters = require('url').parse(req.url, true).query;

  // get the query string to be performed
  var sql_query = require('./sql.js').shipment_build_sql(query_parameters);


  if (sql_query.errors['errors'].length > 0) {
    response.status(422).json(sql_query.errors);
  } else {

    db.any(sql_query.string)
      .then(data => {
        console.log(data);
        response.status(200).json({ records: data });
      })
      .catch(error => {
      // failed
        console.log(error);
      });
  }
});

app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
