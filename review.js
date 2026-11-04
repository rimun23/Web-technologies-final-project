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