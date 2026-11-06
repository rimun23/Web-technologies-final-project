$(function () {
    const $form = $('#reviewForm');
    const $container = $('#reviewsContainer');
    const $author = $('#authorName');
    const $authorHelp = $('#authorHelp');
    const currentUser = typeof getCurrentUser === 'function'
        ? getCurrentUser()
        : JSON.parse(localStorage.getItem('elite_sushi_current_user') || 'null');
    function setupAuthorField() {
        if (currentUser && currentUser.username) {
            $author.val(currentUser.username).prop('readOnly', true).addClass('bg-light');
            $authorHelp.removeClass('text-muted').addClass('text-success').text('You are writing a review as "' + currentUser.username + '".');
        } else {
            $author.prop('readOnly', false).removeClass('bg-light');
            $authorHelp.removeClass('text-success').addClass('text-muted').text('Not logged in. You can specify any name or log in.');
        }
    }
    setupAuthorField();
    function renderReviewCard(review, prepend) {
        const $card = $('<section class="review card shadow-sm p-4 border-0 mb-4 bg-white rounded-3"></section>').html(
            '<div class="row align-items-center g-3 mb-2">' +
                '<div class="col-auto"><div class="imgs">' +
                    '<img src="./img/avatar.jpg" width="60" height="60" class="rounded-circle border border-2 border-danger object-fit-cover" alt="">' +
                '</div></div>' +
                '<div class="col"><div class="stars d-flex align-items-center flex-wrap"></div></div>' +
            '</div>' +
            '<article><h1 class="h5 fw-bold text-dark mb-2"></h1><p class="text-secondary mb-0"></p></article>');
        $card.find('img').attr('alt', review.name);
        $card.find('h1').text(review.name);
        $card.find('p').text(review.text);
        for (let i = 0; i < review.rating; i++) {
            $('<img class="star" src="./img/star1.png" alt="star">').appendTo($card.find('.stars'));
        }
        return prepend ? $card.prependTo($container) : $card.appendTo($container);
    }
    const savedReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
    $.each(savedReviews, function (_, review) { renderReviewCard(review, true); });
    $form.on('input change', '.form-control, .form-select', function () {
        $(this).removeClass('is-invalid');
    });

    $form.on('submit', function (event) {
        event.preventDefault();
        const $text = $('#reviewText');
        const name = (currentUser && currentUser.username) ? currentUser.username : $author.val().trim();
        const rating = parseInt($('#ratingSelect').val(), 10);
        const text = $text.val().trim();
        let isValid = true;
        if (!name) { setInvalid($author, 'Please enter your name.'); isValid = false; }
        if (!text) { setInvalid($text, 'Please write a few words about your order.'); isValid = false; }
        else if (text.length < 5) { setInvalid($text, 'The review is too short (at least 5 characters).'); isValid = false; }
        if (!isValid) return;
        const newReview = { name: name, rating: rating, text: text };
        renderReviewCard(newReview, true).hide().fadeIn(400);
        savedReviews.push(newReview);
        localStorage.setItem('userReviews', JSON.stringify(savedReviews));
        showSuccess($form, 'Thank you! Your review was published.');
        $form.trigger('reset');
        setupAuthorField();
    });
});
