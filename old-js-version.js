function setInvalid(input, errorElement, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (errorElement) errorElement.textContent = message;
}

function setValid(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}
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

        window.location.href = './profile.html';
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reviewForm');
    const container = document.getElementById('reviewsContainer');
    const authorNameInput = document.getElementById('authorName');
    const authorHelp = document.getElementById('authorHelp');
    const currentUser = typeof getCurrentUser === 'function'
        ? getCurrentUser()
        : JSON.parse(localStorage.getItem('elite_sushi_current_user') || 'null');
    function setupAuthorField() {
        if (!authorNameInput) return;
        if (currentUser && currentUser.username) {
            authorNameInput.value = currentUser.username;
            authorNameInput.readOnly = true;
            authorNameInput.classList.add('bg-light');
            if (authorHelp) {
                authorHelp.className = 'form-text text-success small';
                authorHelp.textContent = `You are writing a review as "${currentUser.username}".`;
            }
        } else {
            authorNameInput.readOnly = false;
            authorNameInput.classList.remove('bg-light');
            if (authorHelp) {
                authorHelp.className = 'form-text text-muted small';
                authorHelp.textContent = 'Not logged in. You can specify any name or log in.';
            }
        }
    }
    setupAuthorField();
    function generateStarsHtml(rating) {
        let stars = '';
        for (let i = 0; i < rating; i++) {
            stars += `<img class="star" src="./img/star1.png" alt="star"> `;
        }
        return stars;
    }
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    function renderReviewCard(review, prepend = false) {
        const card = document.createElement('section');
        card.className = 'review card shadow-sm p-4 border-0 mb-4 bg-white rounded-3';
        card.innerHTML = `
            <div class="row align-items-center g-3 mb-2">
                <div class="col-auto">
                    <div class="imgs">
                        <img src="./img/avatar.jpg" alt="${escapeHtml(review.name)}" width="60" height="60" class="rounded-circle border border-2 border-danger object-fit-cover">
                    </div>
                </div>
                <div class="col">
                    <div class="d-flex align-items-center flex-wrap">
                        ${generateStarsHtml(review.rating)}
                    </div>
                </div>
            </div>
            <article>
                <h1 class="h5 fw-bold text-dark mb-2">${escapeHtml(review.name)}</h1>
                <p class="text-secondary mb-0">${escapeHtml(review.text)}</p>
            </article>
        `;
        if (prepend) {
            container.prepend(card);
        } else {
            container.append(card);
        }
    }
    const savedReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    savedReviews.forEach(review => renderReviewCard(review, true));
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = (currentUser && currentUser.username)
                ? currentUser.username
                : (authorNameInput ? authorNameInput.value.trim() : '');
            const rating = parseInt(document.getElementById('ratingSelect').value, 10);
            const text = document.getElementById('reviewText').value.trim();
            if (!name || !text) return;
            const newReview = { name, rating, text };
            renderReviewCard(newReview, true);
            savedReviews.push(newReview);
            localStorage.setItem('userReviews', JSON.stringify(savedReviews));
            form.reset();
            setupAuthorField();
        });
    }
});
function oldShowSavedAlert(saveAlert) {
    if (saveAlert) {
        saveAlert.classList.remove('d-none');
        setTimeout(() => saveAlert.classList.add('d-none'), 3000);
    }
}
