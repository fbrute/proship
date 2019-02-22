'use strict';

var fs = require('fs');

//var contents = fs.readFileSync("modtfregressions_Guadeloup_Ocean_2012_50.json");
//var regressions = JSON.parse(contents);

var mysql      = require('mysql');

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'root',
  host: 'localhost',
  database: 'shipup',
  //password: 'password',
  port: 5432,
})

const getShipments = (request, response) => {
    var query = require('url').parse(req.url,true).query;
    var company_id = query.company_id;
    console.log(company_id);

  pool.query('SELECT * FROM shipments where company_id=' + company_id, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password     : 'sinagfsh',
      database : 'shipup_test',
      port     : '3306'
    });

var getAotAroundData = function (params) {

    connection.connect();
    var stQuery = "SELECT n,ee from modtfregressions where area='" + params.area + "' and year=" + params.year + " and algo='" +  params.algo + "' and resolution=" + 
        params.resolution + " and sat_origin='" + params.sat_origin + "' and aot_length=" + params.aot_length + " and aotaround='" + params.aotaround + "'";
    console.log(stQuery);

    connection.query(stQuery , function(err, rows, fields) {
      if (err) throw err;
        
      console.log(rows);
      return(rows[0]);
    });

    connection.end();
};

var express = require('express');
var router = express.Router();
var morgan = require('morgan');
var port = 3000;
var hostname ='localhost' 
var bodyParser = require('body-parser');

var app = express();

//var regRouter = express.Router();
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//app.route('/Guadeloup/2012/Ocean/50')
//.get(function (req, res, next) {
//    res.json(regressions);
//})


app.get('/api/v1/shipments',
    function (req, response,next) { 
        var query = require('url').parse(req.url,true).query;
        var company_id = query.company_id;
        console.log(company_id);

        pool.query('SELECT * FROM shipments where company_id=' + company_id, 
            (error, results) => {
        if (error) {
            throw error;
        }
        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        //response.status(200).json(results.rows);
        // working all alone!!! response.status(200).json(results.rows);
        var records = {}; 
        records["records"] = JSON.stringify(results.rows) ;
        console.log(records);
        console.log(JSON.stringify(records).replace(/\\"/g, '"'));
        //return( { "records" : response.status(200).json(results.rows) } );
        //return( { records: results.rows } );
        response.send(JSON.stringify(records).replace(/\\"/g, '"'));
        //response.send(JSON.parse(records));


        });
    }
)

/*app.get('/api/v1/shipments', 
    function (req, res,next) { 
        var query = require('url').parse(req.url,true).query;
        var company_id = query.company_id;
        console.log(company_id);
        connection.connect();
        connection.query("SELECT * from shipment where company_id='" + company_id + "'",
            function(err, rows, fields) {
                if (err) throw err;
                return( { records: res.json(rows) } );
            });
        connection.end();

})
*/

// This responds with "Hello World" on the homepage
//app.get('/api/v1/shipments/:company_id', function (req, res) {
//   console.log("Got a GET request for the homepage");
//   console.log(req.params.company_id);
//  res.send('Hello GET');
//})

app.listen(port, hostname, function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});
