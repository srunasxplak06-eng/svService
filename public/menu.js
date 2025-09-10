// ตัวอย่างเมนู (อัซเปลี่ยนรูป/ชื่อ/ราคาได้)
const MENU = [
  {id:1, name:"ข้าวผัดต้มยำกุ้ง", price:79, img:"assets/food1.jpg"},
  {id:2, name:"สลัดอกไก่อบ", price:89, img:"assets/food2.jpg"},
  {id:3, name:"โรตีใส่นม", price:39, img:"assets/food3.jpg"}
];

const cart = {};

function format(n){ return Number(n).toFixed(2); }

function renderMenu(){
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = "";
  MENU.forEach(item=>{
    const card = document.createElement("div");
    card.className = "menu-card";
    card.innerHTML = `
      <div class="menu-thumb"><img src="${item.img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px"/></div>
      <div class="menu-info">
        <h3>${item.name}</h3>
        <p>${item.price} ฿</p>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" data-id="${item.id}" data-op="minus">-</button>
        <div>${getQty(item.id)}</div>
        <button class="qty-btn" data-id="${item.id}" data-op="plus">+</button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll(".qty-btn").forEach(b=>{
    b.addEventListener("click",e=>{
      const id = Number(e.currentTarget.dataset.id);
      const op = e.currentTarget.dataset.op;
      if(op==="plus") addToCart(id,1);
      else addToCart(id,-1);
    });
  });
  renderCart();
}

function getQty(id){ return cart[id]?cart[id].qty:0; }

function addToCart(id, delta){
  const item = MENU.find(m=>m.id===id);
  if(!item) return;
  if(!cart[id] && delta>0) cart[id] = { ...item, qty:0 };
  if(!cart[id]) return;
  cart[id].qty += delta;
  if(cart[id].qty<=0) delete cart[id];
  renderMenu();
}

function renderCart(){
  const el = document.getElementById("cart-items");
  el.innerHTML = "";
  let total = 0;
  Object.values(cart).forEach(it=>{
    total += it.price * it.qty;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `<div>${it.name} x ${it.qty}</div><div>${format(it.price*it.qty)} ฿</div>`;
    el.appendChild(row);
  });
  document.getElementById("cart-total").textContent = format(total);
}

// modal logic
const modal = document.getElementById("checkoutModal");
document.getElementById("checkoutBtn").addEventListener("click",()=>{
  if(Object.keys(cart).length===0){ alert("ตะกร้าว่าง"); return; }
  modal.style.display = "flex";
});
document.getElementById("closeModal").addEventListener("click",()=> modal.style.display="none");

// ส่งคำสั่งไป backend
document.getElementById("confirmOrder").addEventListener("click", async ()=>{
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  if(!name || !address){ alert("กรอกชื่อและที่อยู่ด้วย"); return; }

  const items = Object.values(cart).map(it=>({ id: it.id, name: it.name, qty: it.qty, price: it.price }));
  const total = items.reduce((s,i)=>s+(i.qty*i.price),0);

  try {
    const resp = await fetch("/api/orders", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ customerName:name, phone, address, items, total })
    });
    const data = await resp.json();
    if(data.success){
      alert("สั่งซื้อเรียบร้อย! หมายเลขออเดอร์: " + data.orderId);
      // เคลียร์ตะกร้า และปิด modal
      for(const k of Object.keys(cart)) delete cart[k];
      renderMenu();
      modal.style.display = "none";
      document.getElementById("name").value = "";
      document.getElementById("phone").value = "";
      document.getElementById("address").value = "";
    } else {
      alert("เกิดข้อผิดพลาด: " + (data.error || "unknown"));
    }
  } catch (err) {
    alert("ไม่สามารถเชื่อมต่อ server ได้");
    console.error(err);
  }
});

// init
renderMenu();
