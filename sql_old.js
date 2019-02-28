// File sql.js
// Organize an sql provider
//
'use strict';

exports.shipment_build_sql = function(request) {

  // object to be receiving the results of the sql string building or errors
  var sql_query = { string: '', 
                    errors: { errors: [] } , 
                    params : {  
                      company_id: undefined,
                      sort : 'international_departure_date',
                      direction : 'asc',
                      transport_mode_sql_filter : '', 
                      page : 1,
                      per : 4 
                    } 
  };

  // parse company_id
  function getCompanyId() {
    const company_id = request.company_id;
    if (typeof company_id === 'undefined' || Number(company_id) <= 0) {
      sql_query.errors = { errors: ['company_id is required'] };
    }
  };

  getCompanyId();


  var transport_mode = query.international_transportation_mode;
  var transport_mode_sql_filter;
  if (typeof transport_mode === 'undefined') {
    transport_mode_sql_filter = '';
  } else if (transport_mode !== 'ocean' && transport_mode !== 'truck'){
    sql_query.errors = { errors: ['international transportation mode filter should be ocean or truck'] };
    return sql_query;
  } else {
    transport_mode_sql_filter = ' and international_transportation_mode = ' + "'" + transport_mode + "' ";
  }
  // default direction of sorting by international_departure_date is (asc)ending
  var sort = query.sort || 'international_departure_date';
  if (sort.toUpperCase() !== 'INTERNATIONAL_DEPARTURE_DATE') {
    sql_query.errors = { errors: ['sorting field should be international_departure_date'] };
    return sql_query;
  }

  var direction = query.direction || 'asc';
  const directionUp = direction.toUpperCase();

  // Check sorting direction value
  if (directionUp !== 'ASC' && directionUp !== 'DESC') {
    sql_query.errors = { errors: ['sorting direction should be ASC or DESC'] };
    return sql_query;
  }

  // Handle pagination
  var page = query.page || 1;
  var per = query.per || 4;
  var pagination_sql = ' LIMIT ' + per + ' OFFSET (' + page + ' - 1) * ' + per + ' ';

  sql_query.string = `SELECT s.id as id, s.name as name ,json_agg(to_jsonb(sp) - 'sid') as products FROM shipments s, (select sp.shipment_id as sid, quantity, p.id as id, sku, description, row_number () over ( partition by sp.shipment_id) active_shipment_count from shipment_products sp, products p where sp.product_id = p.id) sp WHERE company_id = ${company_id} ${transport_mode_sql_filter} and sp.sid = s.id GROUP BY s.id order by ${sort} ${direction} ${pagination_sql}`;

  return sql_query;
};

