$(document).ready(function () {
    const STORAGE_KEY = 'eliteSushiCustomQuestions';

    const $faqList = $('#faqList');
    const $form = $('#addFaqForm');
    const $questionInput = $('#faqQuestionInput');

    function loadCustomQuestions() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCustomQuestions(questions) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
        } catch (e) {}
    }

    function createQuestionElement(item, number) {
        const $article = $('<article>', {
            class: 'faq-item bg-white border-0 rounded shadow-sm overflow-hidden',
            'data-custom-id': item.id
        }).data('questionText', item.question);

        const $header = $('<div>', {
            class: 'p-3 d-flex justify-content-between align-items-start gap-2'
        });

        const $title = $('<h3>', {
            class: 'faq-question h6 fw-semibold text-dark mb-0'
        }).text(`Question ${number}: ${item.question}`);

        const $deleteBtn = $('<button>', {
            type: 'button',
            class: 'btn btn-sm btn-outline-danger flex-shrink-0 delete-faq-btn',
            text: 'Delete',
            'aria-label': 'Delete question'
        });

        $header.append($title, $deleteBtn);
        $article.append($header);

        return $article;
    }

    function renumberCustomQuestions() {
        const staticCount = $faqList.find('.faq-item:not([data-custom-id])').length;
        $faqList.find('.faq-item[data-custom-id]').each(function (index) {
            const questionText = $(this).data('questionText');
            $(this).find('.faq-question').text(`Question ${staticCount + index + 1}: ${questionText}`);
        });
    }

    let customQuestions = loadCustomQuestions();
    const initialStaticCount = $faqList.find('.faq-item:not([data-custom-id])').length;

    customQuestions.forEach(function (item, index) {
        $faqList.append(createQuestionElement(item, initialStaticCount + index + 1));
    });

    $questionInput.on('input', function () {
        if ($(this).val().trim().length > 0) {
            $(this).removeClass('is-invalid');
        }
    });

    $form.on('submit', function (e) {
        e.preventDefault();

        const questionText = $questionInput.val().trim();

        if (!questionText) {
            $questionInput.addClass('is-invalid').trigger('focus');
            return;
        }

        $questionInput.removeClass('is-invalid');

        const newItem = {
            id: Date.now(),
            question: questionText
        };

        customQuestions.push(newItem);
        saveCustomQuestions(customQuestions);

        const nextNumber = $faqList.find('.faq-item').length + 1;
        const $newArticle = createQuestionElement(newItem, nextNumber);

        $faqList.append($newArticle);
        $newArticle.hide().slideDown(250);

        this.reset();
    });

    $faqList.on('click', '.delete-faq-btn', function () {
        const $item = $(this).closest('.faq-item');
        const id = $item.data('custom-id');

        customQuestions = customQuestions.filter(function (q) {
            return q.id !== id;
        });
        saveCustomQuestions(customQuestions);

        $item.slideUp(200, function () {
            $(this).remove();
            renumberCustomQuestions();
        });
    });
});