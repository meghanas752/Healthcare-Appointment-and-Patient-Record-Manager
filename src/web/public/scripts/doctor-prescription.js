const form = document.getElementById('rxForm');
const msg  = document.getElementById('msg');
const itemsDiv = document.getElementById('items');
document.getElementById('addItem').onclick = () => {
  const d = document.createElement('div');
  d.className = 'item';
  d.innerHTML = `<input placeholder="Drug" name="drug" />
                 <input placeholder="Dose" name="dose" />
                 <input placeholder="Qty" name="qty" type="number" />`;
  itemsDiv.appendChild(d);
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Saving...';

  const items = [...itemsDiv.querySelectorAll('.item')].map(row => ({
    drug: row.querySelector('[name=drug]').value,
    dose: row.querySelector('[name=dose]').value,
    qty:  row.querySelector('[name=qty]').value
  })).filter(x => x.drug);

  const payload = {
    patient_id: form.patient_id.value.trim(),
    doctor_id:  form.doctor_id.value.trim(),
    notes: form.notes.value,
    items
  };

  try {
    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    msg.textContent = data.ok ? `Created Rx #${data.id}` : 'Failed to create prescription';
  } catch {
    msg.textContent = 'Network error.';
  }
});
