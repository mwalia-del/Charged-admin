const axios = require("axios");
const fs = require("fs");

const base = process.env.BASE_URL || "https://api.charged.autos";
const hdr = { Authorization: `Bearer ${process.env.ADMIN_TOKEN_PROD_TEST}` };

async function get(path, params={}) {
  const { data } = await axios.get(base+path, { params, headers: hdr, timeout: 15000 });
  return data;
}

(async()=>{
  const since = new Date(); 
  since.setMonth(since.getMonth()-3);
  const range = { 
    start: since.toISOString().slice(0,10), 
    end: new Date().toISOString().slice(0,10) 
  };

  const payload = {};
  
  try {
    payload.rides   = await get("/admin/rides/summary", range).catch(()=>null);
    payload.tips    = await get("/admin/tips/summary", range).catch(()=>null);
    payload.wallet  = await get("/admin/wallet/summary", range).catch(()=>null);
    payload.payouts = await get("/admin/payouts/summary", range).catch(()=>null);
    payload.referrals=await get("/admin/referrals/summary", range).catch(()=>null);
    payload.invoices= await get("/admin/invoices/summary", range).catch(()=>null);
    payload.business= await get("/admin/businesses/summary", range).catch(()=>null);
  } catch(e){ 
    console.error("API fetch error", e?.message); 
  }

  fs.writeFileSync("artifacts/recon/api.samples.json", JSON.stringify(payload,null,2));
  console.log("✓ api samples -> artifacts/recon/api.samples.json");
})();
