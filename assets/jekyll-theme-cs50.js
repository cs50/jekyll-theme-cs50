// Infer baseurl from this file's (known) path
const a = document.createElement('a');
a.href = document.currentScript.src;
const matches = a.pathname.match(/^(.+)\/assets\/jekyll-theme-cs50\.js$/);
if (matches) {
    window.baseurl = matches[1];
}

// On DOMContentLoaded
$(document).on('DOMContentLoaded', function() {

    // Current timestamp
    const now = moment();

    // data-after, data-before
    $('[data-after], [data-before]').each(function(index, element) {

        // Return true iff element should be removed
        const remove = function() {
            if (data = $(element).attr('data-before')) {
                return !now.isBefore(moment($(element).attr('data-before')));
            }
            else if (data = $(element).attr('data-after')) {
                return !now.isAfter(moment($(element).attr('data-after')));
            }
        };

        // Remember element's siblings
        const $prev = $(element).prev(), $next = $(element).next();

        // Siblings to be merged
        const SIBLINGS = ['DL', 'OL', 'UL'];

        // If element should be removed
        if (remove()) {

            // Remove element
            $(element).remove();

            // Merge siblings
            if (SIBLINGS.includes($prev.prop('tagName')) && $prev.prop('tagName') === $next.prop('tagName')) {
                $prev.append($next.children());
                $next.remove();
            }
        }
        else {

            // Unwrap element
            const $children = $(element).children().unwrap();

            // If element had one child
            if ($children.length === 1) {

                // Merge siblings
                if (SIBLINGS.includes($children.prop('tagName'))) {
                    if ($prev.prop('tagName') === $children.prop('tagName')) {
                        $children.prepend($prev.children());
                        $prev.remove();
                    }
                    if ($children.prop('tagName') == $next.prop('tagName')) {
                        $children.append($next.children());
                        $next.remove();
                    }
                }
            }
        }
    });

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

    // data-calendar
    $('[data-calendar]').each(function(index, element) {

        // Display calendar in user's time zone
        // https://stackoverflow.com/a/32511510/5156190
        if ($(element).attr('data-calendar')) {
            let src = $(element).attr('data-calendar');
            src += '&ctz=' + luxon.DateTime.local().zoneName;
            $(element).attr('src', src);
        }
    });

    // data-local
    $('[data-local]').each(function(index, element) {

        // HTML to display
        let html;

        // Parse attribute
        const local = $(element).attr('data-local').split('/');

        // If range
        if (local.length == 2) {

            // Parse start
            const start = luxon.DateTime.fromISO(local[0]);

            // Format start without time zone
            html = start.toLocaleString({
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                month: 'long',
                weekday: 'long',
                year: 'numeric'
            });

            // Parse end
            const end = luxon.DateTime.fromISO(local[1]);

            // If start and end on same date
            if (start.toLocaleString(luxon.DateTime.DATE_SHORT) === end.toLocaleString(luxon.DateTime.DATE_SHORT)) {

                // Format end without date
                html += '–' + end.toLocaleString({
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZoneName: 'long'
                });
            }

            // If start and end on different dates
            else {

                // Format end without date
                // https://english.stackexchange.com/a/100754
                html += ' – ' + end.toLocaleString({
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    month: 'long',
                    timeZoneName: 'long',
                    weekday: 'long',
                    year: 'numeric'
                });
            }
        }
        else {

            // Parse start
            const start = luxon.DateTime.fromISO(local[0]);

            // Format start
            html = start.toLocaleString({
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                month: 'long',
                timeZoneName: 'long',
                weekday: 'long',
                year: 'numeric'
            });
        }

        // Display HTML
        $(this).html(html);
    });

    // Return true iff small device (on which aside will be above main)
    function mobile() {
        return $('aside').position().top < $('main').position().top;
    }

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

        // Icons
        const plus = $('<span class="fa-li"><i class="far fa-plus-square"></i></span>');
        const minus = $('<span class="fa-li"><i class="far fa-minus-square"></i></span>');
        const circle = $('<span class="fa-li"><i class="fas fa-circle"></i></span>');

        // Listener
        const click = function(eventObject) {

            // If it wasn't a descendent link that was clicked
            if (!$(eventObject.target).is('a')) {

                // Don't propgate to nested lists
                eventObject.stopPropagation();

                // Toggle marker
                const marker = $(element).attr('data-marker');
                if (marker === '+') {
                    $(element).attr('data-marker', '-');
                    $(element).children('.fa-li').replaceWith(minus);
                }
                else if (marker === '-') {
                    $(element).attr('data-marker', '+');
                    $(element).children('.fa-li').replaceWith(plus);
                }
                $(window).trigger('resize');
            }
        };

        // If +
        if ($(element).attr('data-marker') === '+') {
            $(element).prepend(plus);
            $(element).on('click', click);
        }

        // If -
        else if ($(element).attr('data-marker') === '-') {
            $(element).prepend(minus);
            $(element).on('click', click);
        }

        // If *
        else if ($(element).attr('data-marker') === '*') {
            $(element).prepend(circle);
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
        'main.markdown-body h1',
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

    // Listen for resize
    $(window).resize(function() {

        // Get headings
        const headings = $([
            'main.markdown-body h2:not(.next)',
            'main.markdown-body h3:not(.next)',
            'main.markdown-body h4:not(.next)',
            'main.markdown-body h5:not(.next)',
            'main.markdown-body h6:not(.next)'].join(','));

        // Ensure last heading can be anchored atop page
        let last = headings.last();
        if (last.length) {

            // On small devices
            if (mobile()) {
                var margin = $(window).height() - ($('main').outerHeight() + $('aside').outerHeight() - last.offset().top);
            }

            // On large devices
            else {
                var margin = $(window).height() - ($('main').outerHeight() - last.offset().top);
            }

            // Update margin
            $('main').css('margin-bottom', Math.max(0, Math.ceil(margin)) + 'px');
        }

        // Resize search UI
        if (mobile()) {

            // Shrink
            $('#search .form-control').removeClass('form-control-lg');
            $('#search .btn').removeClass('btn-lg');
        }
        else {

            // Grow
            $('#search .form-control').addClass('form-control-lg');
            $('#search .btn').addClass('btn-lg');
        }

        // Position aside below alert, if any
        if ($('#alert')) {
            const height = $('#alert').outerHeight(true);
            if (mobile()) {
                $('aside').css('height', '');
                $('main').css('margin-top', height + 'px');
            }
            else {
                $('aside').css('height', ($(window).height() - height) + 'px');
                $('main').css('margin-top', height + 'px');
            }
            $('aside').css('top', height + 'px');
        }
    });
    $(window).trigger('resize');

});
