// File sql.js
// Organize an sql provider
//
'use strict';

exports.shipment_build_sql = function(request) {
  // object to be receiving the results of the sql string building or errors
  var sql_query = { string: '', errors: { errors: []} ,
    params : {
      company_id : undefined , 
      sort : 'international_departure_date' , 
      direction : 'asc', 
      transport_mode_sql_filter : '',
      pagination_sql : '' 
    }
  };

  function validParams() {
    //parsing the request parameters
    const company_id = request.company_id;
    if (typeof company_id === 'undefined' || Number(company_id) <= 0) {
      sql_query.errors = { errors: ['company_id is required'] };
    }
    else {
      sql_query.params.company_id = company_id;
    }
    // filter by international transportation mode
    const transport_mode = request.international_transportation_mode;
    if (typeof transport_mode === 'undefined' && transport_mode !== 'ocean' && transport_mode !== 'truck') {
      sql_query.params.transport_mode_sql_filter = '';
    } else {
      sql_query.params.transport_mode_sql_filter = ' and international_transportation_mode = ' + "'" + transport_mode + "' ";
    }

    // default direction of sorting by international_departure_date is (asc)ending
    const sort = request.sort || 'international_departure_date';
    if (sort.toUpperCase() !== 'INTERNATIONAL_DEPARTURE_DATE') {
      sql_query.params.sort = 'international_departure_date';
    }

    var direction = request.direction || 'asc';
    console.log('direction:' + request.direction);
    var directionUp = direction.toUpperCase();

    // Check sorting direction value
    if (directionUp !== 'ASC' && directionUp !== 'DESC') {
      sql_query.params.direction = 'asc';
    } else {
      sql_query.params.direction = direction;
    }

    // Handle pagination
    const page = request.page || 1;
    const per = request.per || 4;
    sql_query.params.pagination_sql = ' LIMIT ' + per + ' OFFSET (' + page + ' - 1) * ' + per + ' ';
  };

  function build_sql() {
    return `SELECT s.id as id, s.name as name ,json_agg(to_jsonb(sp) - 'sid') as products FROM shipments s, (select sp.shipment_id as sid, quantity, p.id as id, sku, description, row_number () over ( partition by sp.shipment_id) active_shipment_count from shipment_products sp, products p where sp.product_id = p.id) sp WHERE company_id = ${sql_query.params.company_id} ${sql_query.params.transport_mode_sql_filter} and sp.sid = s.id GROUP BY s.id order by ${sql_query.params.sort} ${sql_query.params.direction} ${sql_query.params.pagination_sql}`;
  };

  validParams();

  console.log('length:' + sql_query.errors['errors'].length ); 

  if (sql_query.errors['errors'].length === 0) {
    sql_query.string = build_sql();
  }


  return sql_query;
};

