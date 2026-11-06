const DB_KEY = 'elite_sushi_accounts';
const SESSION_KEY = 'elite_sushi_current_user';
const PHONE_CHARS = /^\+?[\d\s()\-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    const digits = value.replace(/\D/g, '');
    return PHONE_CHARS.test(value) && digits.length >= 10 && digits.length <= 15;
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
}
function handleRegister() {
    const $form = $('#registerForm');
    if (!$form.length) return;
    clearErrorsOnInput($form);

    $form.on('submit', function (event) {
        event.preventDefault();
        const $username = $('#username'), $email = $('#email');
        const $password = $('#password'), $confirm = $('#check_password');
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
        if (!password) { setInvalid($password, 'Password is required.'); isValid = false; }
        else if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) { setInvalid($password, 'Password must be at least 6 characters and include both letters and numbers.'); isValid = false; }
        else setValid($password);
        if (!confirm) { setInvalid($confirm, 'Please confirm your password.'); isValid = false; }
        else if (password !== confirm) { setInvalid($confirm, 'Passwords do not match.'); isValid = false; }
        else setValid($confirm);
        if (!isValid) return;
        const newUser = { username, email, password, phone: '', address: '', bonuses: 1500 };
        accounts.push(newUser);
        saveAccounts(accounts);
        setCurrentUser(newUser);
        showSuccess($form, 'Account created! Taking you to your profile...', function () {
            window.location.href = './profile.html';
        });
        $form.trigger('reset');
        $form.find('.form-control').removeClass('is-valid is-invalid');
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
            setInvalid($phone, 'Enter a valid phone number, e.g. +7 777 123 45 67.');
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
    const $form = $('form:first');
    if (!$form.length || !/order\.html$/.test(window.location.pathname)) return;
    clearErrorsOnInput($form);
    $form.on('change', 'input[type="radio"][name="address"]', function () {
        const text = $(this).next('label').text();
        $form.find('input[type="text"][name="address"]').val(text).removeClass('is-invalid');
    });
    $form.find('input[type="radio"][name="address"]:checked').trigger('change');
    $form.on('submit', function (event) {
        event.preventDefault();
        const $name = $('#name'), $phone = $('#phone');
        const name = $name.val().trim(), phone = $phone.val().trim();
        let isValid = true;
        if (name.length < 2) { setInvalid($name, 'Please enter your name (at least 2 characters).'); isValid = false; } else setValid($name);
        if (!phone) { setInvalid($phone, 'Phone is required.'); isValid = false; }
        else if (!isValidPhone(phone)) { setInvalid($phone, 'Enter a valid phone number, e.g. +7 777 123 45 67.'); isValid = false; }
        else setValid($phone);
        if (!isValid) return;
        const user = getCurrentUser();
        const applied = parseInt(localStorage.getItem('elite_sushi_applied_bonuses') || '0', 10);
        if (user && applied > 0) {
            user.bonuses = Math.max(0, (user.bonuses || 0) - applied);
            setCurrentUser(user);
            const accounts = getAccounts();
            const idx = accounts.findIndex(acc => acc.username.toLowerCase() === user.username.toLowerCase());
            if (idx !== -1) { accounts[idx].bonuses = user.bonuses; saveAccounts(accounts); }
            localStorage.removeItem('elite_sushi_applied_bonuses');
        }
        showSuccess($form, 'Payment successful! Your order has been placed.', function () {
            window.location.href = './index.html';
        });
        $form.trigger('reset');
        $form.find('.form-control').removeClass('is-valid is-invalid');
    });
}
$(function () {
    $(document).on('click', '#authLogoutBtn', function (event) {
        event.preventDefault();
        setCurrentUser(null);
        window.location.href = './index.html';
    });
    initAccounts().always(function () {
        renderNavbar();
        handleRegister();
        handleLogin();
        handleProfile();
        handleOrder();
    });
});
