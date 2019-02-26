'use strict';

// var contents = fs.readFileSync("modtfregressions_Guadeloup_Ocean_2012_50.json");
// var regressions = JSON.parse(contents);


const promise = require('bluebird');
const initOptions = {
  promiseLib: promise, // overriding the default (ES6 Promise);
};



const pgp = require('pg-promise')(initOptions);
// See also: http://vitaly-t.github.io/pg-promise/module-pg-promise.html

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


app.get('/api/v1/shipments_working', function(req, response, next) {
  db.task(t => {
    // execute a chain of queries against the task context, and return the result:
    // return t.one('SELECT count(*) FROM shipments WHERE company_id = $1', 2, a => +a.count)
    return t.none('select sp.id as sid, quantity, p.id as id, sku, description into temp table sp2' +
        'from shipment_products sp inner join products p on sp.id = p.id', a => +a.count)
      .then(count => {
        if (count > 0) {
          return t.any('SELECT * FROM products')
            .then(logs => {
              return {count, logs};
            });
        }
        return {count};
      });
  })
    .then(data => {
      // success, data = either {count} or {count, logs}
      console.log(data);
      response.status(200).json({ records: data });
    })
    .catch(error => {
      console.log(error);
    });
});

app.get('/api/v1/shipments', function(req, response, next) {
  // parsing the request parameters
  var query = require('url').parse(req.url, true).query;
  var company_id = query.company_id;

  if (typeof company_id == 'undefined' || Number(company_id) <= 0) {
    response.status(422).json({ errors: ['company_id is required'] });
  }

  var transport_mode = query.international_transportation_mode;
  var transport_mode_sql_filter
  if (typeof transport_mode == 'undefined') {
    transport_mode_sql_filter = '';
  } else if ( transport_mode !== 'ocean' && transport_mode !== 'truck' ){
    response.status(422).json({ errors: ['international transportation mode filter should be ocean or truck'] });
  }
  else {
      transport_mode_sql_filter = ' and international_transportation_mode = ' + "'" +  transport_mode + "' " ;
      console.log(transport_mode_sql_filter);
  }
  
  // Handle pagination
  var page = query.page || 1;
  var per = query.per || 4;
  var pagination_sql = ' LIMIT ' + per + ' OFFSET (' + page + ' - 1) * ' + per + ' '
  console.log(pagination_sql);

  console.log(Number(company_id));

  
  // default direction of sorting by international_departure_date is (asc)ending
  var sort = query.sort || 'international_departure_date';
  if (sort.toUpperCase() !== 'INTERNATIONAL_DEPARTURE_DATE') {
    response.status(422).json({ errors: ['sorting field should be international_departure_date'] });
  }

  var direction = query.direction || 'asc';
  const directionUp = direction.toUpperCase();

  // Check sorting direction value
  if (directionUp !== 'ASC' && directionUp !== 'DESC') {
    response.status(422).json({ errors: ['sorting direction should be ASC or DESC'] });
  }

  console.log('company_id=' + company_id);
  console.log('direction=' + direction);

  
  db.any("SELECT s.id as id, s.name as name ,json_agg(to_jsonb(sp) - 'sid') as products FROM shipments s, (select sp.shipment_id as sid, quantity, p.id as id, sku, description, row_number () over ( partition by sp.shipment_id) active_shipment_count from shipment_products sp, products p where sp.product_id = p.id) sp WHERE company_id = $1" + transport_mode_sql_filter + ' and sp.sid = s.id GROUP BY s.id order by ' + sort + ' ' + direction + pagination_sql , company_id)
    .then(data => {
      console.log(data);
      response.status(200).json({ records: data });
    })
    .catch(error => {
      // failed
      console.log(error);
    });
});


app.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});
