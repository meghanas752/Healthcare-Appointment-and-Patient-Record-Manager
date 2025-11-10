document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#inventory-table tbody");
  const restockForm = document.getElementById("restock-form");
  const dispenseForm = document.getElementById("dispense-form");

  function loadInventory() {
    fetch("/pharmacy/inventory")
      .then(res => res.json())
      .then(data => {
        tableBody.innerHTML = "";
        data.forEach(item => {
          tableBody.insertAdjacentHTML(
            "beforeend",
            `<tr>
              <td>${item.drug_code}</td>
              <td>${item.drug_name}</td>
              <td>${item.stock}</td>
              <td>${new Date(item.updated_at).toLocaleString()}</td>
            </tr>`
          );
        });
      });
  }

  restockForm.addEventListener("submit", e => {
    e.preventDefault();
    const body = {
      drug_code: restockForm.restock_code.value,
      qty: parseInt(restockForm.restock_qty.value)
    };
    fetch("/pharmacy/restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.text())
      .then(alert)
      .then(loadInventory);
  });

  dispenseForm.addEventListener("submit", e => {
    e.preventDefault();
    const body = {
      drug_code: dispenseForm.dispense_code.value,
      qty: parseInt(dispenseForm.dispense_qty.value),
      ref_id: dispenseForm.ref_id.value || null
    };
    fetch("/pharmacy/dispense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.text())
      .then(alert)
      .then(loadInventory);
  });

  loadInventory();
});
