
select sp.shipment_id as sid, quantity, p.id as id, sku, description, row_number () over ( partition by sp.shipment_id) active_shipment_count from shipment_products sp, products p where sp.product_id = p.id;

select sp.shipment_id as sid, quantity, p.id as id, sku, description from shipment_products sp, products p where sp.product_id = p.id;

SELECT s.id as id, s.name as name ,json_agg(to_jsonb(sp) - 'sid') as products FROM shipments s inner JOIN sp2 sp on sp.sid = s.id where company_id = 2 GROUP BY s.id;


SELECT 
    s.id as id, s.name as name ,json_agg(to_jsonb(sp) - 'sid') as products 
FROM 
    shipments s, (select sp.shipment_id as sid, quantity, p.id as id, sku, description, row_number () over ( partition by sp.shipment_id) active_shipment_count from shipment_products sp, products p where sp.product_id = p.id;) sp
WHERE  company_id = 2 and sp.sid = s.id GROUP BY s.id;

