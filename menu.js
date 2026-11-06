$(function () {
    const $panel = $('<div class="input-group mb-4"></div>').prependTo('main .container');
    $('<input type="search" id="menuFilter" class="form-control" placeholder="Filter the menu (e.g. cola, set, tea)...">').appendTo($panel);
    const $empty = $('<p class="text-muted text-center d-none">Nothing found. Try another word.</p>').appendTo($panel.parent());
    $('#menuFilter').on('input', function () {
        const query = $(this).val().trim().toLowerCase();
        let found = 0;
        $('main article.card').each(function () {
            const $col = $(this).parent();
            const title = $(this).find('.card-title').text().toLowerCase();
            if (title.indexOf(query) !== -1) { found++; $col.fadeIn(200); }
            else { $col.fadeOut(200); }
        });
        $empty.toggleClass('d-none', found > 0);
    });
    $('main').on('mouseenter mouseleave', 'article.card', function () {
        $(this).toggleClass('shadow-sm shadow');
    });
});
