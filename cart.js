const CART_STORAGE_KEY = 'elite_sushi_cart';
const APPLIED_BONUS_KEY = 'elite_sushi_applied_bonuses';
function getCartItems() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return JSON.parse(stored);
}
function saveCartItems(items) { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); }
function getAppliedBonuses() { return parseInt(localStorage.getItem(APPLIED_BONUS_KEY) || '0', 10); }
function setAppliedBonuses(val) { localStorage.setItem(APPLIED_BONUS_KEY, val.toString()); }
function showToast(message) {
    $('<div>')
        .addClass('alert alert-success shadow position-fixed bottom-0 end-0 m-3')
        .text(message)
        .hide()
        .appendTo('body')
        .fadeIn(200)
        .delay(1500)
        .fadeOut(400, function () { $(this).remove(); });
}
function renderCart() {
    const $list = $('.cart-items');
    if (!$list.length) return;

    const items = getCartItems();
    $list.empty();

    if (items.length === 0) {
        $('<li class="text-center py-4 text-muted fs-5">Your cart is empty.</li>').appendTo($list);
        $('#cartSubtotal, #cartFinalTotal').text('0 ₸');
        $('#discountRow').addClass('d-none');
        $('#bonusSection').empty();
        return;
    }
    let subtotal = 0;
    $.each(items, function (index, item) {
        subtotal += item.price * item.count;
        const $li = $('<li class="card shadow-sm p-3 mb-3 border-0 bg-white rounded-3 d-flex flex-row align-items-center justify-content-between gap-3"></li>')
            .html(
                '<div class="d-flex align-items-center gap-3">' +
                    '<img class="rounded-2 cart-item-img" width="60" height="60" alt="">' +
                    '<div><h6 class="item-name fw-bold mb-1 text-dark"></h6>' +
                    '<span class="item-price text-danger fw-semibold"></span></div>' +
                '</div>' +
                '<div class="d-flex align-items-center gap-2">' +
                    '<button type="button" class="cart-minus btn btn-sm btn-outline-secondary px-2">-</button>' +
                    '<span class="item-count fw-bold px-2"></span>' +
                    '<button type="button" class="cart-plus btn btn-sm btn-outline-secondary px-2">+</button>' +
                    '<button type="button" class="cart-remove btn btn-sm btn-outline-danger ms-2">&times;</button>' +
                '</div>')
            .attr('data-index', index)
            .appendTo($list);
        $li.find('img').attr({ src: item.img, alt: item.name });
        $li.find('.item-name').text(item.name);
        $li.find('.item-price').text(item.price.toLocaleString() + ' ₸');
        $li.find('.item-count').text(item.count);
    });
    $list.find('li:last').addClass('mb-0');
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('elite_sushi_current_user') || 'null');
    let appliedBonus = getAppliedBonuses();
    const $bonus = $('#bonusSection');
    if ($bonus.length) {
        if (user) {
            const userBonuses = user.bonuses || 0;
            const maxUsable = Math.min(userBonuses, subtotal);
            if (appliedBonus > maxUsable) { appliedBonus = maxUsable; setAppliedBonuses(appliedBonus); }
            $bonus.html(
                '<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2"><div>' +
                '<span class="fw-bold text-dark">Loyalty Bonuses:</span> ' +
                '<span class="badge bg-warning text-dark fs-6 ms-1">' + userBonuses + ' bonuses</span>' +
                '<small class="text-muted d-block">(Rate 1:1 — 1 bonus = 1 ₸ discount)</small></div></div>' +
                '<div class="input-group" style="max-width: 320px;">' +
                '<input type="number" id="bonusInput" class="form-control" min="0" max="' + maxUsable + '" value="' + appliedBonus + '" placeholder="Amount">' +
                '<button class="btn btn-outline-secondary" type="button" id="maxBonusBtn">Max</button>' +
                '<button class="btn btn-danger" type="button" id="applyBonusBtn">Apply</button></div>');
        } else {
            setAppliedBonuses(0);
            appliedBonus = 0;
            $bonus.html('<div class="alert alert-light border d-flex justify-content-between align-items-center mb-0 p-2">' +
                '<span class="small text-secondary">Want to spend bonuses? <a href="./login.html" class="fw-bold text-danger text-decoration-none">Sign in</a></span></div>');
        }
    }
    const finalTotal = Math.max(0, subtotal - appliedBonus);
    $('#cartSubtotal').text(subtotal.toLocaleString() + ' ₸');
    $('#cartFinalTotal').text(finalTotal.toLocaleString() + ' ₸');
    $('#cartDiscount').text('-' + appliedBonus.toLocaleString() + ' ₸');
    $('#discountRow').toggleClass('d-none', appliedBonus <= 0);
}
function parsePrice(text) { return parseInt(text.replace(/\D/g, ''), 10); }
$(function () {
    renderCart();
    $('.cart-items').on('click', '.cart-plus, .cart-minus', function () {
        const index = $(this).closest('li').data('index');
        const items = getCartItems();
        items[index].count += $(this).hasClass('cart-plus') ? 1 : -1;
        if (items[index].count <= 0) items.splice(index, 1);
        saveCartItems(items);
        renderCart();
    });
    $('.cart-items').on('click', '.cart-remove', function () {
        const $li = $(this).closest('li');
        const index = $li.data('index');
        $li.slideUp(300, function () {
            const items = getCartItems();
            items.splice(index, 1);
            saveCartItems(items);
            renderCart();
        });
    });
    $('#bonusSection')
        .on('click', '#maxBonusBtn', function () {
            $('#bonusInput').val($('#bonusInput').attr('max'));
        })
        .on('change', '#bonusInput', function () {
            const max = parseInt($(this).attr('max'), 10);
            let val = parseInt($(this).val() || '0', 10);
            $(this).val(Math.min(Math.max(val, 0), max));
        })
        .on('click', '#applyBonusBtn', function () {
            const max = parseInt($('#bonusInput').attr('max'), 10);
            const val = Math.min(Math.max(parseInt($('#bonusInput').val() || '0', 10), 0), max);
            setAppliedBonuses(val);
            renderCart();
        });
    $('main').on('click', 'a.btn-outline-danger[href="./cart.html"]', function (event) {
        event.preventDefault();
        const $card = $(this).closest('.card');
        const name = $card.find('.card-title').text().trim();
        const price = parsePrice($card.find('.card-text.fw-bold.text-danger').first().text());
        const img = $card.find('img').first().attr('src');
        const items = getCartItems();
        const existing = items.find(it => it.name === name);
        if (existing) existing.count += 1;
        else items.push({ id: Date.now(), name: name, price: price, count: 1, img: img });
        saveCartItems(items);
        showToast(name + ' added to cart');
    });
});
