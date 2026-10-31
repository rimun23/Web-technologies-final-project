// cart.js — Управление корзиной и бонусами 1:1

const CART_STORAGE_KEY = 'elite_sushi_cart';
const APPLIED_BONUS_KEY = 'elite_sushi_applied_bonuses';

// Тестовый товар по умолчанию, если корзина пустая (Morimoto Set как в ТЗ)
function getCartItems() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
        const defaultCart = [
            { id: 1, name: '"Morimoto" Set', price: 6250, count: 1, img: './img/Set Morimoto.jpg' }
        ];
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(defaultCart));
        return defaultCart;
    }
    return JSON.parse(stored);
}

function saveCartItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function getAppliedBonuses() {
    return parseInt(localStorage.getItem(APPLIED_BONUS_KEY) || '0', 10);
}

function setAppliedBonuses(val) {
    localStorage.setItem(APPLIED_BONUS_KEY, val.toString());
}

// Рендер корзины
function renderCart() {
    const listEl = document.querySelector('.cart-items');
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const discountRow = document.getElementById('discountRow');
    const finalTotalEl = document.getElementById('cartFinalTotal');
    const bonusSection = document.getElementById('bonusSection');

    if (!listEl) return;

    const items = getCartItems();
    listEl.innerHTML = '';

    if (items.length === 0) {
        listEl.innerHTML = '<li class="text-center py-4 text-muted fs-5">Your cart is empty.</li>';
        if (subtotalEl) subtotalEl.textContent = '0 ₸';
        if (finalTotalEl) finalTotalEl.textContent = '0 ₸';
        if (bonusSection) bonusSection.innerHTML = '';
        return;
    }

    let subtotal = 0;

    items.forEach((item, index) => {
        subtotal += item.price * item.count;
        const li = document.createElement('li');
        li.className = 'card shadow-sm p-3 mb-3 border-0 bg-white rounded-3 d-flex flex-row align-items-center justify-content-between gap-3';
        li.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <img src="${item.img}" alt="${item.name}" class="rounded-2" width="60" height="60" style="object-fit: cover;">
                <div>
                    <h6 class="fw-bold mb-1 text-dark">${item.name}</h6>
                    <span class="text-danger fw-semibold">${item.price.toLocaleString()} ₸</span>
                </div>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="changeCount(${index}, -1)">-</button>
                <span class="fw-bold px-2">${item.count}</span>
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="changeCount(${index}, 1)">+</button>
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeItem(${index})">&times;</button>
            </div>
        `;
        listEl.appendChild(li);
    });

    // Обработка бонусов (1 бонус = 1 ₸)
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('elite_sushi_current_user') || 'null');
    let appliedBonus = getAppliedBonuses();

    if (bonusSection) {
        if (user) {
            const userBonuses = user.bonuses || 0;
            const maxUsable = Math.min(userBonuses, subtotal);

            // Если сумма заказа уменьшилась ниже списанных бонусов — корректируем
            if (appliedBonus > maxUsable) {
                appliedBonus = maxUsable;
                setAppliedBonuses(appliedBonus);
            }

            bonusSection.innerHTML = `
                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                    <div>
                        <span class="fw-bold text-dark">Loyalty Bonuses:</span>
                        <span class="badge bg-warning text-dark fs-6 ms-1">${userBonuses} bonuses</span>
                        <small class="text-muted d-block">(Rate 1:1 — 1 bonus = 1 ₸ discount)</small>
                    </div>
                </div>
                <div class="input-group" style="max-width: 320px;">
                    <input type="number" id="bonusInput" class="form-control" min="0" max="${maxUsable}" value="${appliedBonus}" placeholder="Amount">
                    <button class="btn btn-outline-secondary" type="button" id="maxBonusBtn">Max</button>
                    <button class="btn btn-danger" type="button" id="applyBonusBtn">Apply</button>
                </div>
            `;

            document.getElementById('maxBonusBtn').addEventListener('click', () => {
                document.getElementById('bonusInput').value = maxUsable;
            });

            document.getElementById('applyBonusBtn').addEventListener('click', () => {
                let val = parseInt(document.getElementById('bonusInput').value || '0', 10);
                if (val < 0) val = 0;
                if (val > maxUsable) val = maxUsable;
                setAppliedBonuses(val);
                renderCart();
            });

        } else {
            setAppliedBonuses(0);
            bonusSection.innerHTML = `
                <div class="alert alert-light border d-flex justify-content-between align-items-center mb-0 p-2">
                    <span class="small text-secondary">Want to spend bonuses? <a href="./login.html" class="fw-bold text-danger text-decoration-none">Sign in</a></span>
                </div>
            `;
        }
    }

    const finalTotal = Math.max(0, subtotal - appliedBonus);

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} ₸`;
    if (finalTotalEl) finalTotalEl.textContent = `${finalTotal.toLocaleString()} ₸`;

    if (discountRow && discountEl) {
        if (appliedBonus > 0) {
            discountRow.classList.remove('d-none');
            discountEl.textContent = `-${appliedBonus.toLocaleString()} ₸`;
        } else {
            discountRow.classList.add('d-none');
        }
    }
}

window.changeCount = function(index, delta) {
    const items = getCartItems();
    items[index].count += delta;
    if (items[index].count <= 0) {
        items.splice(index, 1);
    }
    saveCartItems(items);
    renderCart();
};

window.removeItem = function(index) {
    const items = getCartItems();
    items.splice(index, 1);
    saveCartItems(items);
    renderCart();
};

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});