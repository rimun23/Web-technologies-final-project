const DB_KEY = 'elite_sushi_accounts';
const SESSION_KEY = 'elite_sushi_current_user';
const CART_KEY = 'elite_sushi_cart';
const APPLIED_BONUSES_KEY = 'elite_sushi_applied_bonuses';
const PHONE_CHARS = /^\+?[\d\s()\-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const DIGIT_REGEX = /\d/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;
const EYE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/></svg>';
const EYE_SLASH_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/><path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/></svg>';
const PASSWORD_RULES = [
    { key: 'length', selector: '#req-length', label: 'At least 8 characters' },
    { key: 'upper', selector: '#req-upper', label: 'At least 1 uppercase letter (A-Z)' },
    { key: 'lower', selector: '#req-lower', label: 'At least 1 lowercase letter (a-z)' },
    { key: 'digit', selector: '#req-digit', label: 'At least 1 number (0-9)' },
    { key: 'special', selector: '#req-special', label: 'At least 1 special character (!, %, :, *, etc.)' }
];

function getPasswordChecks(password) {
    return {
        length: password.length >= 8,
        upper: UPPERCASE_REGEX.test(password),
        lower: LOWERCASE_REGEX.test(password),
        digit: DIGIT_REGEX.test(password),
        special: SPECIAL_CHAR_REGEX.test(password)
    };
}

function isPasswordValid(password) {
    const checks = getPasswordChecks(password);
    return checks.length && checks.upper && checks.lower && checks.digit && checks.special;
}

function updatePasswordChecklist(password, forceError = false) {
    const checks = getPasswordChecks(password);
    const isEmpty = password.length === 0 && !forceError;

    PASSWORD_RULES.forEach(function (rule) {
        const $item = $(rule.selector);
        if (!$item.length) return;
        const passed = checks[rule.key];

        $item.removeClass('text-secondary text-success text-danger fw-semibold');
        if (isEmpty) {
            $item.addClass('text-secondary').text('✗ ' + rule.label);
        } else if (passed) {
            $item.addClass('text-success fw-semibold').text('✓ ' + rule.label);
        } else {
            $item.addClass('text-danger').text('✗ ' + rule.label);
        }
    });
}
function getCartTotalCount() {
    try {
        const items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        if (!Array.isArray(items)) return 0;
        return items.reduce(function (sum, item) {
            return sum + (parseInt(item.count, 10) || 0);
        }, 0);
    } catch (e) {
        return 0;
    }
}

function renderCartBadge() {
    const count = getCartTotalCount();
    $('.navbar-nav a[href*="cart.html"]').each(function () {
        const $link = $(this);
        let $badge = $link.find('.cart-nav-badge');
        if (!$badge.length) {
            $badge = $('<span class="badge rounded-pill ms-1 cart-nav-badge"></span>').appendTo($link);
        }
        $badge
            .text(count)
            .toggleClass('bg-danger', count > 0)
            .toggleClass('bg-secondary', count === 0);
    });
}

function clearCart() {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    localStorage.removeItem(APPLIED_BONUSES_KEY);
    renderCartBadge();
}

function initAccounts() {
    if (localStorage.getItem(DB_KEY)) return $.Deferred().resolve().promise();
    return $.getJSON('./accounts.json')
        .done(function (data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); })
        .fail(function () { localStorage.setItem(DB_KEY, JSON.stringify([])); });
}
function getAccounts() { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
function saveAccounts(accounts) { localStorage.setItem(DB_KEY, JSON.stringify(accounts)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
function setCurrentUser(user) {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
}
function feedbackFor($input) {
    let $fb = $input.siblings('.invalid-feedback');
    if (!$fb.length) $fb = $('<div class="invalid-feedback"></div>').insertAfter($input);
    return $fb;
}
function setInvalid($input, message) {
    $input.addClass('is-invalid').removeClass('is-valid');
    feedbackFor($input).text(message);
}
function setValid($input) {
    $input.removeClass('is-invalid').addClass('is-valid');
}
function isValidPhone(value) {
    const trimmed = value.trim();
    if (!PHONE_CHARS.test(trimmed)) return false;
    const digits = trimmed.replace(/\D/g, '');
    if (trimmed.startsWith('+7') || trimmed.startsWith('7') || trimmed.startsWith('8')) {
        return digits.length === 11;
    }
    return digits.length >= 10 && digits.length <= 15;
}
function formatPhoneInput(value) {
    const trimmed = value.trim();
    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) return trimmed === '+' ? '+' : '';

    // Международный номер не на +7 / 8 оставляем без жёсткой маски
    if (trimmed.startsWith('+') && !trimmed.startsWith('+7')) {
        return '+' + digitsOnly.slice(0, 15);
    }

    let digits = digitsOnly;
    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    } else if (!digits.startsWith('7')) {
        digits = '7' + digits;
    }
    digits = digits.slice(0, 11);

    let formatted = '+7';
    if (digits.length > 1) formatted += ' (' + digits.slice(1, 4);
    if (digits.length > 4) formatted += ') ' + digits.slice(4, 7);
    if (digits.length > 7) formatted += '-' + digits.slice(7, 9);
    if (digits.length > 9) formatted += '-' + digits.slice(9, 11);
    return formatted;
}
function formatCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}
function formatExpiryDate(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
        return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
}
function isValidLuhn(digits) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
function validateCardNumber(value) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return { valid: false, message: 'Card number is required.' };
    if (digits.length !== 16) return { valid: false, message: 'Card number must contain 16 digits.' };
    if (/^0+$/.test(digits) || !isValidLuhn(digits)) {
        return { valid: false, message: 'Invalid card number (check the digits).' };
    }
    return { valid: true };
}
function validateExpiry(value) {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, message: 'Expiry date is required.' };
    const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(trimmed);
    if (!match) return { valid: false, message: 'Use MM/YY format (e.g. 12/28).' };

    const expMonth = parseInt(match[1], 10);
    const expYear = 2000 + parseInt(match[2], 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        return { valid: false, message: 'This card has expired.' };
    }
    if (expYear > currentYear + 20) {
        return { valid: false, message: 'Enter a realistic expiry year.' };
    }
    return { valid: true };
}
function validateCvv(value) {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, message: 'CVV/CVC is required.' };
    if (!/^\d{3}$/.test(trimmed)) return { valid: false, message: 'CVV/CVC must be 3 digits.' };
    return { valid: true };
}
function showSuccess($beforeEl, message, done) {
    $('<div class="alert alert-success" role="alert"></div>')
        .text(message)
        .hide()
        .insertBefore($beforeEl)
        .fadeIn(300)
        .delay(1200)
        .fadeOut(300, function () {
            $(this).remove();
            if (done) done();
        });
}
function clearErrorsOnInput($form) {
    $form.on('input change', '.form-control', function () {
        $(this).removeClass('is-invalid is-valid');
    });
}
function renderNavbar() {
    const user = getCurrentUser();
    $('.navbar-nav').each(function () {
        const $nav = $(this);
        $nav.find('.logout-li').remove();
        const $profileLi = $nav.find('a[href*="profile.html"]').closest('li');
        const $authLi = $nav.find('a[href*="register.html"], a[href*="login.html"]').closest('li');
        if (user) {
            $profileLi.show();
            $authLi.hide();
            $('<li class="nav-item logout-li"><a class="nav-link text-danger fw-semibold" href="#" id="authLogoutBtn">Log out</a></li>')
                .appendTo($nav);
        } else {
            $profileLi.hide();
            $authLi.show();
        }
    });
       renderCartBadge();
}
function handleRegister() {
    const $form = $('#registerForm');
    if (!$form.length) return;

    const $username = $('#username'), $email = $('#email');
    const $password = $('#password'), $confirm = $('#check_password');

    $form.on('input change', '#username, #email', function () {
        $(this).removeClass('is-invalid is-valid');
    });

    function validateConfirmLive() {
        const password = $password.val();
        const confirm = $confirm.val();
        if (!confirm) {
            $confirm.removeClass('is-invalid is-valid');
            return;
        }
        if (password === confirm) {
            setValid($confirm);
        } else {
            setInvalid($confirm, 'Passwords do not match.');
        }
    }

    $password.on('input', function () {
        const password = $(this).val();
        updatePasswordChecklist(password);

        if (!password) {
            $password.removeClass('is-invalid is-valid');
        } else if (isPasswordValid(password)) {
            setValid($password);
        } else {
            setInvalid($password, 'Password must meet all requirements below.');
        }

        if ($confirm.val().length > 0) {
            validateConfirmLive();
        }
    });

    $confirm.on('input', validateConfirmLive);

    $form.on('submit', function (event) {
        event.preventDefault();
        const username = $username.val().trim();
        const email = $email.val().trim().toLowerCase();
        const password = $password.val();
        const confirm = $confirm.val();
        const accounts = getAccounts();
        let isValid = true;

        if (!username) { setInvalid($username, 'Username is required.'); isValid = false; }
        else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setInvalid($username, 'Username must be 3-20 characters (letters, numbers, underscores).'); isValid = false; }
        else if (accounts.some(acc => acc.username.toLowerCase() === username.toLowerCase())) { setInvalid($username, 'This username is already taken.'); isValid = false; }
        else setValid($username);

        if (!email) { setInvalid($email, 'Email is required.'); isValid = false; }
        else if (!EMAIL_REGEX.test(email)) { setInvalid($email, 'Please enter a valid email address (e.g. user@domain.com).'); isValid = false; }
        else if (accounts.some(acc => acc.email.toLowerCase() === email)) { setInvalid($email, 'An account with this email already exists.'); isValid = false; }
        else setValid($email);

        if (!password) {
            updatePasswordChecklist('', true);
            setInvalid($password, 'Password is required.');
            isValid = false;
        } else if (!isPasswordValid(password)) {
            updatePasswordChecklist(password, true);
            setInvalid($password, 'Password must meet all requirements below.');
            isValid = false;
        } else {
            updatePasswordChecklist(password);
            setValid($password);
        }

        if (!confirm) { setInvalid($confirm, 'Please confirm your password.'); isValid = false; }
        else if (password !== confirm) { setInvalid($confirm, 'Passwords do not match.'); isValid = false; }
        else setValid($confirm);

        if (!isValid) return;

        const newUser = { username, email, password, phone: '', address: '', bonuses: 1500 };
        accounts.push(newUser);
        saveAccounts(accounts);
        setCurrentUser(newUser);
        clearCart();
        showSuccess($form, 'Account created! Taking you to your profile...', function () {
            window.location.href = './profile.html';
        });
        $form.trigger('reset');
        $form.find('.toggle-password').each(function () {
            const $btn = $(this);
            $($btn.data('target')).attr('type', 'password');
            $btn.html(EYE_ICON).attr({ 'aria-label': 'Show password', title: 'Show password' });
        });
        $form.find('.form-control').removeClass('is-valid is-invalid');
        updatePasswordChecklist('');
    });
}
function handleLogin() {
    const $form = $('#loginForm');
    if (!$form.length) return;
    clearErrorsOnInput($form);
    $form.on('submit', function (event) {
        event.preventDefault();
        const $id = $('#username'), $pass = $('#password');
        const identifier = $id.val().trim().toLowerCase();
        const password = $pass.val();
        const user = getAccounts().find(acc =>
            (acc.username.toLowerCase() === identifier || acc.email.toLowerCase() === identifier) && acc.password === password);
        if (!user) {
            setInvalid($pass, 'Invalid username/email or password!');
            return;
        }
        setCurrentUser(user);
        clearCart();
        window.location.href = './profile.html';
    });
}
function handleProfile() {
    const $form = $('#profileForm');
    if (!$form.length) return;
    const user = getCurrentUser();
    if (!user) { window.location.href = './login.html'; return; }
    const $phone = $('#profilePhone'), $address = $('#profileAddress');
    $('#profileUsername').text(user.username);
    $('#profileEmail').text(user.email || 'No email');
    $('#profileBonuses').text(user.bonuses !== undefined ? user.bonuses : 0);
    $phone.val(user.phone || '');
    $address.val(user.address || '');
    $('#useBonusesBtn').on('click', function () { window.location.href = './cart.html'; });
    clearErrorsOnInput($form);
    $form.on('submit', function (event) {
        event.preventDefault();
        const phone = $phone.val().trim();
        const address = $address.val().trim();
        if (phone && !isValidPhone(phone)) {
            setInvalid($phone, 'Enter a valid phone number, e.g. +7 (777) 123-45-67.');
            return;
        }
        setValid($phone);
        user.phone = phone;
        user.address = address;
        setCurrentUser(user);
        const accounts = getAccounts();
        const idx = accounts.findIndex(acc => acc.username.toLowerCase() === user.username.toLowerCase());
        if (idx !== -1) { accounts[idx].phone = phone; accounts[idx].address = address; saveAccounts(accounts); }
        $('#saveAlert').removeClass('d-none').hide().fadeIn(300).delay(3000).fadeOut(400);
    });
}
function handleOrder() {
    const $form = $('#orderForm');
    if (!$form.length) return;

    const $name = $('#name');
    const $phone = $('#phone');
    const $address = $('#orderAddress');
    const $apartment = $('#apartment');
    const $entrance = $('#entrance');
    const $floor = $('#floor');
    const $persons = $('#persons');
    const $personsError = $('#personsError');
    const $orderTime = $('#orderTime');
    const $cardNumber = $('#cardNumber');
    const $expiry = $('#expiry');
    const $cvv = $('#cvv');

    clearErrorsOnInput($form);

    // Сброс ошибки поля приборов при вводе
    $persons.on('input change', function () {
        $personsError.addClass('d-none').text('');
    });

    // Автоматические маски при вводе
    $phone.on('input', function () {
        $(this).val(formatPhoneInput($(this).val()));
    });
    $cardNumber.on('input', function () {
        $(this).val(formatCardNumber($(this).val()));
    });
    $expiry.on('input', function () {
        $(this).val(formatExpiryDate($(this).val()));
    });
    $cvv.on('input', function () {
        $(this).val($(this).val().replace(/\D/g, '').slice(0, 3));
    });
    $entrance.on('input', function () {
        $(this).val($(this).val().replace(/\D/g, '').slice(0, 2));
    });
    $floor.on('input', function () {
        $(this).val($(this).val().replace(/(?!^-)[^\d]/g, '').slice(0, 3));
    });

    // Мгновенная проверка полей при потере фокуса (blur)
    $phone.on('blur', function () {
        const val = $(this).val().trim();
        if (!val) return;
        if (isValidPhone(val)) setValid($phone);
        else setInvalid($phone, 'Enter a valid phone number, e.g. +7 (777) 123-45-67.');
    });
    $cardNumber.on('blur', function () {
        const val = $(this).val().trim();
        if (!val) return;
        const res = validateCardNumber(val);
        if (res.valid) setValid($cardNumber);
        else setInvalid($cardNumber, res.message);
    });
    $expiry.on('blur', function () {
        const val = $(this).val().trim();
        if (!val) return;
        const res = validateExpiry(val);
        if (res.valid) setValid($expiry);
        else setInvalid($expiry, res.message);
    });
    $cvv.on('blur', function () {
        const val = $(this).val().trim();
        if (!val) return;
        const res = validateCvv(val);
        if (res.valid) setValid($cvv);
        else setInvalid($cvv, res.message);
    });

    $form.on('change', 'input[type="radio"][name="address"]', function () {
        const text = $(this).next('label').text();
        $address.val(text).removeClass('is-invalid is-valid');
    });
    $form.find('input[type="radio"][name="address"]:checked').trigger('change');

    $form.on('submit', function (event) {
        event.preventDefault();
        let isValid = true;

        // 1. Имя
        const name = $name.val().trim();
        if (!name) {
            setInvalid($name, 'Name is required.');
            isValid = false;
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-']{2,50}$/.test(name)) {
            setInvalid($name, 'Enter a valid name (2–50 letters).');
            isValid = false;
        } else {
            setValid($name);
        }

        // 2. Телефон
        const phone = $phone.val().trim();
        if (!phone) {
            setInvalid($phone, 'Phone is required.');
            isValid = false;
        } else if (!isValidPhone(phone)) {
            setInvalid($phone, 'Enter a valid phone number, e.g. +7 (777) 123-45-67.');
            isValid = false;
        } else {
            setValid($phone);
        }

        // 3. Время доставки
        if (!$orderTime.val()) {
            setInvalid($orderTime, 'Please select delivery time.');
            isValid = false;
        } else {
            setValid($orderTime);
        }

        // 4. Адрес
        const address = $address.val().trim();
        if (!address) {
            setInvalid($address, 'Address is required.');
            isValid = false;
        } else if (address.length < 5) {
            setInvalid($address, 'Please enter a full address (at least 5 characters).');
            isValid = false;
        } else {
            setValid($address);
        }

        // 5. Квартира, подъезд, этаж (необязательные, но проверяются если заполнены)
        const apartment = $apartment.val().trim();
        if (apartment && !/^[a-zA-Zа-яА-Я0-9\-\/]{1,6}$/.test(apartment)) {
            setInvalid($apartment, 'Invalid');
            isValid = false;
        } else if (apartment) {
            setValid($apartment);
        }

        const entrance = $entrance.val().trim();
        if (entrance) {
            const entNum = parseInt(entrance, 10);
            if (!/^\d+$/.test(entrance) || entNum < 1 || entNum > 30) {
                setInvalid($entrance, '1–30');
                isValid = false;
            } else {
                setValid($entrance);
            }
        }

        const floor = $floor.val().trim();
        if (floor) {
            const flNum = parseInt(floor, 10);
            if (!/^-?\d+$/.test(floor) || flNum < -2 || flNum > 100) {
                setInvalid($floor, '-2..100');
                isValid = false;
            } else {
                setValid($floor);
            }
        }

        // 6. Количество приборов
        const personsVal = $persons.val().trim();
        const personsNum = Number(personsVal);
        if (!personsVal || !Number.isInteger(personsNum) || personsNum < 1 || personsNum > 10) {
            $persons.addClass('is-invalid').removeClass('is-valid');
            $personsError.removeClass('d-none').text('Select from 1 to 10 utensils.');
            isValid = false;
        } else {
            setValid($persons);
            $personsError.addClass('d-none').text('');
        }

        // 7. Номер карты
        const cardCheck = validateCardNumber($cardNumber.val());
        if (!cardCheck.valid) {
            setInvalid($cardNumber, cardCheck.message);
            isValid = false;
        } else {
            setValid($cardNumber);
        }

        // 8. Срок действия карты
        const expiryCheck = validateExpiry($expiry.val());
        if (!expiryCheck.valid) {
            setInvalid($expiry, expiryCheck.message);
            isValid = false;
        } else {
            setValid($expiry);
        }

        // 9. CVV/CVC
        const cvvCheck = validateCvv($cvv.val());
        if (!cvvCheck.valid) {
            setInvalid($cvv, cvvCheck.message);
            isValid = false;
        } else {
            setValid($cvv);
        }

        if (!isValid) return;

        const user = getCurrentUser();
        const applied = parseInt(localStorage.getItem(APPLIED_BONUSES_KEY) || '0', 10);
        let earned = 0;
        if (user) {
            // order total from the cart, minus the bonuses spent
            let cartItems = [];
            try { cartItems = JSON.parse(localStorage.getItem(CART_KEY) || '[]') || []; } catch (e) { cartItems = []; }
            const subtotal = cartItems.reduce(function (sum, it) {
                return sum + (parseInt(it.price, 10) || 0) * (parseInt(it.count, 10) || 0);
            }, 0);
            const spent = Math.min(applied, subtotal, user.bonuses || 0);
            const paid = Math.max(0, subtotal - spent);
            earned = Math.floor(paid * 0.05); // 5% of the paid amount
            user.bonuses = Math.max(0, (user.bonuses || 0) - spent) + earned;
            setCurrentUser(user);
            const accounts = getAccounts();
            const idx = accounts.findIndex(acc => acc.username.toLowerCase() === user.username.toLowerCase());
            if (idx !== -1) { accounts[idx].bonuses = user.bonuses; saveAccounts(accounts); }
        }
        localStorage.removeItem(APPLIED_BONUSES_KEY);
        clearCart();
        showSuccess($form, 'Payment successful! Your order has been placed.' + (earned > 0 ? ' +' + earned + ' bonuses (5% cashback) added to your account.' : ''), function () {
            window.location.href = './index.html';
        });
        $form.trigger('reset');
        $form.find('.form-control, .form-select').removeClass('is-valid is-invalid');
        $personsError.addClass('d-none').text('');
    });
}
$(function () {
    $(document).on('click', '#authLogoutBtn', function (event) {
        event.preventDefault();
        setCurrentUser(null);
        clearCart();
        window.location.href = './index.html';
    });
    initAccounts().always(function () {
        renderNavbar();
        handleRegister();
        handleLogin();
        handleProfile();
        handleOrder();
    });
    $(document).on('click', '.toggle-password', function () {
        const $btn = $(this);
        const $input = $($btn.data('target'));
        if (!$input.length) return;

        const isHidden = $input.attr('type') === 'password';
        $input.attr('type', isHidden ? 'text' : 'password');
        $btn.html(isHidden ? EYE_SLASH_ICON : EYE_ICON);
        $btn.attr({
            'aria-label': isHidden ? 'Hide password' : 'Show password',
            title: isHidden ? 'Hide password' : 'Show password'
        });
    });
    renderCartBadge();
    $(window).on('storage', function (e) {
        if (e.originalEvent && e.originalEvent.key === CART_KEY) {
            renderCartBadge();
        }
    });
});