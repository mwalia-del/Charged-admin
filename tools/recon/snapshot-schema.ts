import { Client } from "pg";
import fs from "fs";

const url = process.env.PG_URL!;

(async()=>{
  const c = new Client({ connectionString: url });
  await c.connect();
  
  const q = `
  select table_schema, table_name, column_name, data_type, is_nullable
  from information_schema.columns
  where table_schema not in ('pg_catalog','information_schema')
  order by table_schema, table_name, ordinal_position;`;
  
  const res = await c.query(q);
  
  fs.mkdirSync("artifacts/recon", {recursive:true});
  fs.writeFileSync("artifacts/recon/schema.snapshot.json", JSON.stringify(res.rows,null,2));
  
  await c.end();
  console.log("✓ schema snapshot -> artifacts/recon/schema.snapshot.json");
})();
