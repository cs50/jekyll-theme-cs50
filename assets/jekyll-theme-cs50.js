$(document).on('DOMContentLoaded', function() {

    // data-alert
    $('[data-alert]').each(function(index, element) {
        if ($(element).attr('data-alert')) {
            $(element).addClass('alert-' + $(element).attr('data-alert'));
            $(element).find('a').addClass('alert-link');
            $(element).find('h1, h2, h3, h4, h5, h6').each(function(index, element) {
                const tagName = $(element).prop('tagName');
                $(element).replaceWith(function() {
                    return $('<p>').append($(this).contents()).addClass(tagName.toLowerCase()).addClass('alert-heading');
                });
            });
        }
    });

    // Get next slice of elements
    function next(element) {

        // Next siblings
        const siblings = element.nextAll();

        // First sibling after this element
        const start = siblings.index(element) + 1;

        // Following buttons
        const buttons = siblings.slice(start).find('[data-next]');

        // Last sibling before next button
        let end = (buttons.length > 0) ? siblings.index(buttons[0]) : siblings.length;

        // Next slice
        return siblings.slice(start, end);
    }

    // Scroll to y
    function scroll(y) {
        $('html, body').animate({scrollTop: y}, 500);
    }

    // data-markers
    $('[data-marker]').each(function(index, element) {

        // Add .fa-ul to parent ul
        $(element).parent().addClass('fa-ul');

        // Prepend icon
        if ($(element).attr('data-marker') === '+') {
            $(element).prepend('<span class="fa-li fa-sm"><i class="fas fa-play fa-xs"></i></span>');
        }
        else if ($(element).attr('data-marker') === '-') {
            $(element).prepend('<span class="fa-li"><i class="fas fa-caret-left"></i></span>');
        }
        else if ($(element).attr('data-marker') === '*') {
            $(element).prepend('<span class="fa-li"><i class="fas fa-circle"></i></span>');
        }
    });

    // data-next
    $('[data-next]').each(function(index, element) {

        // Hide next elements
        next($(this).parent()).addClass('next');

        // Listen for clicks
        $(this).click(function() {

            // Show next elements
            next($(this).parent()).removeClass('next');

            // Update margin
            $(window).trigger('resize');

            // Remember p-wrapped button's offset
            let top = $(this).parent().offset().top;
            let bottom = top + $(this).parent().outerHeight(true);

            // Scroll to next elements
            scroll(bottom + 1);

            // Disable button
            $(this).prop('disabled', true);
        });
    });

    // Ensure iframes responsive in Safari on iOS (for, e.g., Google Calendars), per https://stackoverflow.com/a/23083463/5156190
    $('iframe').each(function(index, element) {
        if (!$(this).attr('scrolling')) {
            $(this).attr('scrolling', 'no');
        }
    });

    // Get headings
    let headings = $([
        'main.markdown-body h2',
        'main.markdown-body h3',
        'main.markdown-body h4',
        'main.markdown-body h5',
        'main.markdown-body h6'].join(','));

    // Add anchors to headings
    headings.each(function(index, element) {
        if ($(element).attr('id') && $(element).has('a').length === 0) {
            $(element).wrapInner($('<a data-id href="#' + $(element).attr('id') + '"></a>'));
        }
    });

    // Previous slice(s) of elements
    function previous(element) {

        // Previous siblings
        return element.prevAll();
    }

    // Listen for hashchange
    $(window).on('hashchange', function() {

        // Find heading
        const id = window.location.hash.slice(1);
        if (!id) {
            return false;
        }
        const heading = $('#' + id);
        if (!heading.length) {
            return false;
        }

        // Previous siblings
        previous(heading).removeClass('next').find('[data-next]').prop('disabled', true);

        // This heading
        heading.removeClass('next');

        // Next siblings
        next(heading).removeClass('next');

        // Scroll to heading
        const top = Math.floor(heading.offset().top - parseInt(heading.css('marginTop')));
        scroll(top);
    });
    $(window).trigger('hashchange');

    // Ensure last heading can be anchored atop page
    $(window).resize(function() {

        // Get headings
        const headings = $([
            'main.markdown-body h2:not(.next)',
            'main.markdown-body h3:not(.next)',
            'main.markdown-body h4:not(.next)',
            'main.markdown-body h5:not(.next)',
            'main.markdown-body h6:not(.next)'].join(','));

        // Get last heading
        let last = headings.last();
        if (last.length) {

            // On small devices
            if ($('aside').position().top < $('main').position().top) {
                var margin = $(window).height() - ($('main').outerHeight() + $('aside').outerHeight() - last.offset().top);
            }

            // On large devices
            else {
                var margin = $(window).height() - ($('main').outerHeight() - last.offset().top);
            }

            // Update margin
            $('main').css('margin-bottom', Math.max(0, Math.ceil(margin)) + 'px');
        }
    });
    $(window).trigger('resize');

});
