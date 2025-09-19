import { Client } from "pg";
import fs from "fs";

const apply = process.env.CONFIRM_APPLY === "1";

if(!apply){ 
  console.log("DRY RUN: not applying views. Set CONFIRM_APPLY=1 to apply."); 
  process.exit(0); 
}

const sql = fs.readFileSync("plan/views.fix.sql","utf8");

(async()=>{
  const c = new (require("pg").Client)({ connectionString: process.env.PG_URL });
  await c.connect();
  await c.query("begin");
  
  try {
    await c.query(sql);
    await c.query("commit");
    console.log("✓ Views applied.");
  } catch(e:any){
    await c.query("rollback");
    console.error("✗ Failed to apply views:", e.message);
    process.exit(1);
  } finally { 
    await c.end(); 
  }
})();
