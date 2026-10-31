// auth.js — Единый скрипт авторизации, профиля и навигации
const DB_KEY = 'elite_sushi_accounts';
const SESSION_KEY = 'elite_sushi_current_user';

// Загрузка начальных данных из accounts.json
async function initAccounts() {
    if (!localStorage.getItem(DB_KEY)) {
        try {
            const res = await fetch('./accounts.json');
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem(DB_KEY, JSON.stringify(data));
            } else {
                localStorage.setItem(DB_KEY, JSON.stringify([]));
            }
        } catch (e) {
            localStorage.setItem(DB_KEY, JSON.stringify([]));
        }
    }
}

function getAccounts() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
}

function saveAccounts(accounts) {
    localStorage.setItem(DB_KEY, JSON.stringify(accounts));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

// 1. Управление навигацией (без дублирования кнопок Profile)
function renderNavbar() {
    const user = getCurrentUser();
    const navbars = document.querySelectorAll('.navbar-nav');

    navbars.forEach(nav => {
        nav.querySelectorAll('.logout-li').forEach(li => li.remove());

        const profileLink = nav.querySelector('a[href*="profile.html"]');
        const authLink = nav.querySelector('a[href*="register.html"], a[href*="login.html"]');
        const profileLi = profileLink ? profileLink.closest('li') : null;
        const authLi = authLink ? authLink.closest('li') : null;

        if (user) {
            // Пользователь вошел:
            if (profileLi) {
                profileLi.style.display = '';
                profileLink.textContent = `Profile`;
            }
            if (authLi) {
                authLi.style.display = 'none';
            }

            // Добавляем кнопку Log out
            const logoutLi = document.createElement('li');
            logoutLi.className = 'nav-item logout-li';
            logoutLi.innerHTML = `<a class="nav-link text-danger fw-semibold" href="#" id="authLogoutBtn">Log out</a>`;
            nav.appendChild(logoutLi);

            logoutLi.querySelector('#authLogoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                setCurrentUser(null);
                window.location.href = './index.html';
            });
        } else {
            // Гость:
            if (profileLi) {
                profileLi.style.display = 'none'; // СКРЫВАЕМ кнопку Profile
            }
            if (authLi) {
                authLi.style.display = ''; // ПОКАЗЫВАЕМ Sign up/Sign in
            }
        }
    });
}

// Вспомогательные функции валидации (Bootstrap UI)
function setInvalid(input, errorElement, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (errorElement) errorElement.textContent = message;
}

function setValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}

// 2. Регистрация по всем требованиям
function handleRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const checkPasswordInput = document.getElementById('check_password');

    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Очистка ошибок при вводе
    [usernameInput, emailInput, passwordInput, checkPasswordInput].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', () => {
            inp.classList.remove('is-invalid');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const checkPassword = checkPasswordInput.value;

        let isValid = true;
        const accounts = getAccounts();

        // 1. Требование к Username (мин 3 символа, только буквы/цифры/подчеркивание)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!username) {
            setInvalid(usernameInput, usernameError, 'Username is required.');
            isValid = false;
        } else if (!usernameRegex.test(username)) {
            setInvalid(usernameInput, usernameError, 'Username must be 3-20 characters (letters, numbers, underscores).');
            isValid = false;
        } else if (accounts.some(acc => acc.username.toLowerCase() === username.toLowerCase())) {
            setInvalid(usernameInput, usernameError, 'This username is already taken.');
            isValid = false;
        } else {
            setValid(usernameInput);
        }

        // 2. Требование к Email (корректный email формат)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setInvalid(emailInput, emailError, 'Email is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setInvalid(emailInput, emailError, 'Please enter a valid email address (e.g. user@domain.com).');
            isValid = false;
        } else if (accounts.some(acc => acc.email.toLowerCase() === email)) {
            setInvalid(emailInput, emailError, 'An account with this email already exists.');
            isValid = false;
        } else {
            setValid(emailInput);
        }

        // 3. Требование к Password (мин. 6 символов, буквы и цифры)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!password) {
            setInvalid(passwordInput, passwordError, 'Password is required.');
            isValid = false;
        } else if (!passwordRegex.test(password)) {
            setInvalid(passwordInput, passwordError, 'Password must be at least 6 characters and include both letters and numbers.');
            isValid = false;
        } else {
            setValid(passwordInput);
        }

        // 4. Требование к Confirm Password (полное совпадение)
        if (!checkPassword) {
            setInvalid(checkPasswordInput, confirmPasswordError, 'Please confirm your password.');
            isValid = false;
        } else if (password !== checkPassword) {
            setInvalid(checkPasswordInput, confirmPasswordError, 'Passwords do not match.');
            isValid = false;
        } else {
            setValid(checkPasswordInput);
        }

        if (!isValid) return;

        // Создаем пользователя: телефон и адрес изначально пустые!
        const newUser = {
            username: username,
            email: email,
            password: password,
            phone: '',
            address: '',
            bonuses: 1500
        };

        accounts.push(newUser);
        saveAccounts(accounts);
        setCurrentUser(newUser);

        // Переход в профиль после успешной валидации
        window.location.href = './profile.html';
    });
}

// 3. Авторизация (Login)
function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const identifier = document.getElementById('username').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        const accounts = getAccounts();
        const user = accounts.find(acc => 
            (acc.username.toLowerCase() === identifier || acc.email.toLowerCase() === identifier) && 
            acc.password === password
        );

        if (!user) {
            alert('Invalid username/email or password!');
            return;
        }

        setCurrentUser(user);
        window.location.href = './profile.html';
    });
}

// 4. Профиль: отображение и сохранение адреса/номера
function handleProfile() {
    if (!window.location.pathname.endsWith('profile.html')) return;

    const user = getCurrentUser();
    if (!user) {
        window.location.href = './login.html';
        return;
    }

    const usernameDisplay = document.getElementById('profileUsername');
    const emailDisplay = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');
    const addressInput = document.getElementById('profileAddress');
    const bonusesDisplay = document.getElementById('profileBonuses');
    const form = document.getElementById('profileForm');
    const saveAlert = document.getElementById('saveAlert');
    const useBonusesBtn = document.getElementById('useBonusesBtn');

    if (usernameDisplay) usernameDisplay.textContent = user.username;
    if (emailDisplay) emailDisplay.textContent = user.email || 'No email';
    if (bonusesDisplay) bonusesDisplay.textContent = user.bonuses !== undefined ? user.bonuses : 0;
    if (phoneInput) phoneInput.value = user.phone || '';
    if (addressInput) addressInput.value = user.address || '';

    // Кнопка "use bonuses" переносит пользователя в корзину для списания
    if (useBonusesBtn) {
        useBonusesBtn.addEventListener('click', () => {
            window.location.href = './cart.html';
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const updatedPhone = phoneInput.value.trim();
            const updatedAddress = addressInput.value.trim();

            user.phone = updatedPhone;
            user.address = updatedAddress;

            setCurrentUser(user);

            const accounts = getAccounts();
            const idx = accounts.findIndex(acc => acc.username.toLowerCase() === user.username.toLowerCase());
            if (idx !== -1) {
                accounts[idx].phone = updatedPhone;
                accounts[idx].address = updatedAddress;
                saveAccounts(accounts);
            }

            if (saveAlert) {
                saveAlert.classList.remove('d-none');
                setTimeout(() => saveAlert.classList.add('d-none'), 3000);
            }
        });
    }
}
// Обработка оформления заказа и списания бонусов со счета навсегда
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('order.html')) {
        const user = getCurrentUser();
        const applied = parseInt(localStorage.getItem('elite_sushi_applied_bonuses') || '0', 10);
        const orderForm = document.querySelector('form');

        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (user && applied > 0) {
                    // Списываем бонусы со счета навсегда
                    user.bonuses = Math.max(0, (user.bonuses || 0) - applied);
                    setCurrentUser(user);

                    const accounts = getAccounts();
                    const idx = accounts.findIndex(acc => acc.username.toLowerCase() === user.username.toLowerCase());
                    if (idx !== -1) {
                        accounts[idx].bonuses = user.bonuses;
                        saveAccounts(accounts);
                    }
                    // Очищаем списанные бонусы
                    localStorage.removeItem('elite_sushi_applied_bonuses');
                }

                alert('Payment successful! Your order has been placed.');
                window.location.href = './index.html';
            });
        }
    }
});
document.addEventListener('DOMContentLoaded', async () => {
    await initAccounts();
    renderNavbar();
    handleRegister();
    handleLogin();
    handleProfile();
});
