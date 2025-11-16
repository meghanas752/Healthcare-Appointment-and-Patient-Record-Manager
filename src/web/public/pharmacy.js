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

    // ✅ RESTOCK
    restockForm.addEventListener("submit", e => {
      e.preventDefault();
      const body = {
        drug_code: restockForm.restock_code.value,
        qty: parseInt(restockForm.restock_qty.value),
        price: parseFloat(restockForm.restock_price.value)
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

    // ✅ DISPENSE MEDICINE
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

    // ✅ GENERATE BILL FOR A PRESCRIPTION ID
    document.getElementById("generate_bill_btn").addEventListener("click", () => {
      const pid = document.getElementById("prescription_id_bill").value;
      if (!pid) return alert("Enter Prescription ID");

      fetch(`/pharmacy/final-bill/${pid}`)
        .then(res => res.json())
        .then(data => {
          let html = "<h3>Bill Summary</h3>";
          html += "<table><tr><th>Drug</th><th>Qty</th><th>Price</th><th>Total</th></tr>";

          data.items.forEach(i => {
            html += `<tr>
                <td>${i.drug_code}</td>
                <td>${i.qty}</td>
                <td>${i.unit_price}</td>
                <td>${i.total}</td>
            </tr>`;
          });

          html += `</table><h2>Total Bill Amount: Rs ${data.total}</h2>`;
          document.getElementById("bill_output").innerHTML = html;
        });
    });

    loadInventory();
});