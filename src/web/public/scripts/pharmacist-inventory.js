const msg = document.getElementById('msg');
const tbody = document.querySelector('#tbl tbody');

async function load() {
  tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
  const r = await fetch('/api/inventory');
  const d = await r.json();
  tbody.innerHTML = (d.items || []).map(it =>
    `<tr><td>${it.drug_code||''}</td><td>${it.drug_name||''}</td><td>${it.stock||0}</td></tr>`
  ).join('') || "<tr><td colspan='3'>(empty)</td></tr>";
}
document.getElementById('refresh').onclick = load;

document.getElementById('dispenseForm').onsubmit = async (e)=>{
  e.preventDefault();
  const f = e.target;
  const payload = {
    drug_code: f.drug_code.value.trim(),
    qty: Number(f.qty.value),
    prescription_id: f.prescription_id.value ? Number(f.prescription_id.value) : undefined
  };
  const r = await fetch('/api/inventory/dispense', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  const d = await r.json();
  msg.textContent = d.msg || 'Done';
  load();
};

document.getElementById('restockForm').onsubmit = async (e)=>{
  e.preventDefault();
  const f = e.target;
  const payload = { drug_code: f.drug_code.value.trim(), qty: Number(f.qty.value) };
  const r = await fetch('/api/inventory/restock', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  const d = await r.json();
  msg.textContent = d.msg || 'Done';
  load();
};

load();
//end