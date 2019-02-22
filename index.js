'use strict';

// Server that provides json records coming from mysql database

var fs = require('fs');

//var contents = fs.readFileSync("modtfregressions_Guadeloup_Ocean_2012_50.json");
//var regressions = JSON.parse(contents);

var mysql      = require('mysql');

var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'dbmeteodb',
      password : 'dbmeteodb',
      database : 'dbmeteodb'
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

app.route('/:collection/:area/:year/:algo/:resolution/:sat_origin/:aot_length/:aotaround')
.get(function (req, res, next) {
    console.log(req.params.area);
        connection.query("SELECT n,ee from modtfregressions where area='" + req.params.area + "' and year=" + req.params.year + " and algo='" +  req.params.algo + "' and resolution=" + 
        req.params.resolution + " and sat_origin='" + req.params.sat_origin + "' and aot_length=" + req.params.aot_length + " and aotaround='" + req.params.aotaround + "'" + " and collection = '" + req.params.collection + "'", 
            function(err, rows, fields) {
                if (err) throw err;
                return(res.json(rows[0]));
            });
})

app.route('/regressions/:area/:year/:algo/:collection')
.get(function (req, res, next) {
    console.log(req.params.area);
        var stQuery = "SELECT * from modtfregressions where area='" + req.params.area + "' and year=" + req.params.year + " and algo='" +  req.params.algo + "' and collection = '" + req.params.collection +
                         "' order by aot_length, resolution, sat_origin, aotaround";
        console.log(stQuery);
        connection.query(stQuery, 
            function(err, rows, fields) {
                if (err) throw err;
                //console.log(rows);
                return(res.json(rows));
            });
})

app.route('/regsRowsByAotLength/:area/:year/:algo/:collection')
.get(function (req, res, next) {
    console.log(req.params.area);
        var stQuery = "SELECT distinct area, year, algo, aot_length, sat_origin , collection from modtfregressions where area='" + req.params.area + "' and year=" + req.params.year + " and algo='" +  req.params.algo + "'" + " and collection = '" + req.params.collection +  "'  order by year, area, aot_length, sat_origin desc";
    
        console.log(stQuery);
        connection.query(stQuery,
            function(err, rows, fields) {
                if (err) throw err;
                return(res.json(rows));
            });
})

app.route('/importAeronet')
.post(function (req, res,next) {
    console.log(req.params.area);
        connection.query("SELECT distinct area, year, algo, aot_length, sat_origin from modtfregressions where area='" + req.params.area + "' and year=" + req.params.year + " and algo='" +  req.params.algo + 
            "'  order by year, area, aot_length, sat_origin desc",
            function(err, rows, fields) {
                if (err) throw err;
                return(res.json(rows));
            });
})
app.listen(port, hostname, function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});
