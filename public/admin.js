async function fetchOrders(){
  const res = await fetch("/api/orders");
  const rows = await res.json();
  const container = document.getElementById("ordersList");
  container.innerHTML = "";
  rows.forEach(o=>{
    const el = document.createElement("div");
    el.className = "order-card";
    el.innerHTML = `
      <div class="order-head">
        <div>
          <strong>#${o.id}</strong> — ${o.customerName} • ${new Date(o.created_at).toLocaleString()}
          <div style="color:#666">${o.phone} — ${o.address}</div>
        </div>
        <div style="text-align:right">
          <div>${o.total.toFixed(2)} ฿</div>
          <div style="margin-top:8px">
            <select data-id="${o.id}" class="status-select">
              <option ${o.status==='รอชำระ/รอรับคำสั่ง'?'selected':''}>รอชำระ/รอรับคำสั่ง</option>
              <option ${o.status==='กำลังทำ'?'selected':''}>กำลังทำ</option>
              <option ${o.status==='ส่งแล้ว'?'selected':''}>ส่งแล้ว</option>
              <option ${o.status==='ยกเลิก'?'selected':''}>ยกเลิก</option>
            </select>
          </div>
        </div>
      </div>
      <div class="order-items">
        ${o.items.map(i=>`<div>${i.name} x ${i.qty} — ${i.price} ฿</div>`).join("")}
      </div>
    `;
    container.appendChild(el);
  });

  document.querySelectorAll(".status-select").forEach(s=>{
    s.addEventListener("change", async (e)=>{
      const id = e.target.dataset.id;
      const status = e.target.value;
      await fetch(`/api/orders/${id}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({status})
      });
      fetchOrders();
    });
  });
}

fetchOrders();
setInterval(fetchOrders, 10000); // refresh ทุก 10 วินาที
