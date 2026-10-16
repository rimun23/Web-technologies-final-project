/* Elite Sushi — shopping cart (vanilla JS + localStorage)
   menu.html: кнопки "Add to cart" добавляют товар
   cart.html: рисует товары в <ul class="cart-items"> и считает .cart-total */
(function () {
  'use strict';

  var KEY = 'eliteSushiCart';

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }
  function save(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    updateBadge();
  }

  function money(n) { return n.toLocaleString('en-US') + ' ₸'; }
  function count(cart) { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function total(cart) { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function addItem(item) {
    var cart = load();
    var found = cart.find(function (i) { return i.id === item.id; });
    if (found) found.qty += 1;
    else cart.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
    save(cart);
  }
  function setQty(id, qty) {
    var cart = load();
    var item = cart.find(function (i) { return i.id === id; });
    if (!item) return null;
    item.qty = Math.max(1, Math.min(99, qty || 1));
    save(cart);
    return item;
  }
  function removeItem(id) {
    save(load().filter(function (i) { return i.id !== id; }));
  }

  function updateBadge() {
    var link = document.querySelector('a.nav-link[href$="cart.html"]');
    if (!link) return;
    var badge = link.querySelector('.cart-badge');
    if (!badge) {
      badge = el('span', 'cart-badge badge rounded-pill bg-danger ms-1');
      link.appendChild(badge);
    }
    var n = count(load());
    badge.textContent = n;
    badge.style.display = n ? '' : 'none';
  }


  function toast(message) {
    var t = el('div', 'bg-dark text-light rounded shadow px-3 py-2', message);
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2000;opacity:0;transition:opacity .2s';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; });
    setTimeout(function () {
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 250);
    }, 1600);
  }

  function initMenu() {
    document.querySelectorAll('.card a[href$="cart.html"]').forEach(function (a) {
      var card = a.closest('.card');
      var titleEl = card.querySelector('.card-title');
      var priceEl = card.querySelector('.text-danger');
      var imgEl = card.querySelector('img');
      if (!titleEl || !priceEl) return;

      var price = parseInt(priceEl.textContent.replace(/\D/g, ''), 10);
      if (!price) return;
      var name = titleEl.textContent.trim();

      var btn = el('button', a.className, a.textContent);
      btn.type = 'button';
      btn.addEventListener('click', function () {
        addItem({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: name,
          price: price,
          img: imgEl ? imgEl.getAttribute('src') : ''
        });
        toast('"' + name + '" added to cart');
      });
      a.replaceWith(btn);
    });
  }

  function renderTotal() {
    var cart = load();
    var totalEl = document.querySelector('.cart-total');
    if (totalEl) totalEl.textContent = money(total(cart));
    var checkout = document.querySelector('.cart-checkout');
    if (checkout) checkout.classList.toggle('disabled', !cart.length);
  }

  function buildItem(item, list) {
    var li = el('li', 'cart-item card shadow-sm p-3 mb-3 border-0 bg-white rounded-3');
    var row = el('div', 'row align-items-center g-3');

    var colImg = el('div', 'col-auto');
    var img = el('img', 'cart-item-img rounded');
    img.src = item.img || './img/placeholder.png';
    img.alt = item.name; img.width = 70; img.height = 70;
    img.style.objectFit = 'cover';
    colImg.appendChild(img);

    var colName = el('div', 'col-12 col-sm');
    colName.appendChild(el('p', 'cart-item-name fw-semibold fs-5 mb-0 text-dark', item.name));

    var colPrice = el('div', 'col-6 col-sm-auto text-sm-end');
    var priceP = el('p', 'cart-item-price fw-bold text-danger fs-5 mb-0', money(item.price * item.qty));
    var unit = el('small', 'text-muted', money(item.price) + ' each');
    colPrice.appendChild(priceP);
    colPrice.appendChild(unit);

    var colQty = el('div', 'col-6 col-sm-auto');
    var input = el('input', 'cart-item-qty form-control form-control-sm text-center mx-auto');
    input.type = 'number'; input.min = 1; input.max = 99; input.value = item.qty;
    input.style.maxWidth = '80px';
    input.setAttribute('aria-label', 'Quantity of ' + item.name);
    input.addEventListener('change', function () {
      var updated = setQty(item.id, parseInt(input.value, 10));
      if (!updated) return;
      input.value = updated.qty;
      priceP.textContent = money(updated.price * updated.qty);
      renderTotal();
    });
    colQty.appendChild(input);

    var colDel = el('div', 'col-12 col-sm-auto');
    var del = el('button', 'cart-item-remove btn btn-outline-danger btn-sm w-100', 'Remove');
    del.type = 'button';
    del.addEventListener('click', function () { removeItem(item.id); renderCart(list); });
    colDel.appendChild(del);

    [colImg, colName, colPrice, colQty, colDel].forEach(function (c) { row.appendChild(c); });
    li.appendChild(row);
    return li;
  }

  function renderCart(list) {
    var cart = load();
    list.textContent = '';
    if (!cart.length) {
      var li = el('li', 'text-center py-5');
      li.appendChild(el('p', 'fs-4 text-muted', 'Your cart is empty'));
      var go = el('a', 'btn btn-danger', 'Go to menu');
      go.href = './menu.html';
      li.appendChild(go);
      list.appendChild(li);
    } else {
      cart.forEach(function (item) { list.appendChild(buildItem(item, list)); });
    }
    renderTotal();
  }
  document.addEventListener('DOMContentLoaded', function () {
    updateBadge();
    var list = document.querySelector('.cart-items');
    if (list) renderCart(list);
    else initMenu();
  });

  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    updateBadge();
    var list = document.querySelector('.cart-items');
    if (list) renderCart(list);
  });
})();
