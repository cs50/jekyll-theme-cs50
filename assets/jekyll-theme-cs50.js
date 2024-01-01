// Infer baseurl from this file's (known) path
const a = document.createElement('a');
a.href = document.currentScript.src;
const matches = a.pathname.match(/^(.+)\/assets\/jekyll-theme-cs50\.js$/);
if (matches) {
    window.baseurl = matches[1];
}

// https://github.com/typekit/webfontloader#get-started
WebFont.load({
    google: {
        families: ['PT Sans', 'PT Sans:bold', 'PT Sans:ital']
    }
});

// On DOMContentLoaded
$(document).on('DOMContentLoaded', function() {

    // Current timestamp
    const now = luxon.DateTime.local();

    // data-after, data-before
    $('[data-after], [data-before]').each(function(index, element) {

        // Return true iff element should be removed
        const remove = function() {
            if (data = $(element).attr('data-before')) {
                return !(now < luxon.DateTime.fromISO($(element).attr('data-before')));
            }
            else if (data = $(element).attr('data-after')) {
                return !(now > luxon.DateTime.fromISO($(element).attr('data-after')));
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

    // Remembers that alert with hash has been dismissed by storing hash in localStorage
    const dismiss = function(hash) {
        let alert;
        try {
            alert = JSON.parse(localStorage.getItem('alert'));
            if (!Array.isArray(alert)) {
                throw new Error();
            }
        }
        catch (err) {
            alert = [];
        }
        if (!alert.includes(hash)) {
            alert.push(hash);
        }
        localStorage.setItem('alert', JSON.stringify(alert));
    };

    // Returns true iff alert with hash has already been dismissed
    const dismissed = function(hash) {
        try {
            const alert = JSON.parse(localStorage.getItem('alert'));
            return Array.isArray(alert) && alert.includes(hash);
        }
        catch (err) {
            return false;
        }
    };

    // Listen for dismissal of fixed-top alert
    $('#alert').on('closed.bs.alert', function() {

        // Resize UI
        $(window).trigger('resize');

        // Remember that alert has been dismissed
        dismiss($(this).attr('data-hash'));
    });

    // Remove fixed-top alert if already dismissed
    if (dismissed($('#alert').attr('data-hash'))) {
        $('#alert').remove();
    }

    // Listen for details in fixed-top alert
    $('#alert details').on('toggle', function() {

        // Resize UI
        $(window).trigger('resize');
    });

    // data-alert
    $('[data-alert]').each(function(index, element) {

        // Split data-alert on whitespace
        for (let alert of $(element).attr('data-alert').split(/ +/)) {

            // If valid class
            if (['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'dismissible'].includes(alert)) {

                // Add it to element
                $(element).addClass('alert-' + alert);
            }
        }

        // If dismissible, reveal button
        if ($(element).hasClass('alert-dismissible')) {
            $(element).children('[data-bs-dismiss]').removeClass('d-none');
        }

        // Add .alert-link to links
        $(element).find('a').addClass('alert-link');

        // Add .alert-heading to headings
        $(element).find('h1, h2, h3, h4, h5, h6').each(function(index, element) {
            const tagName = $(element).prop('tagName');
            $(element).replaceWith(function() {
                return $('<p>').append($(this).contents()).addClass(tagName.toLowerCase()).addClass('alert-heading');
            });
        });
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
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#Syntax
    // https://english.stackexchange.com/a/100754
    $('[data-local]').each(function(index, element) {

        // HTML to display
        let html;

        // Parse attribute
        const local = $(element).attr('data-local');
        const locals = local.split('/');

        // If range
        if (locals.length == 2) {

            // Parse start
            const start = luxon.DateTime.fromISO(locals[0]).setLocale(CS50.locale);

            // Parse end
            const end = luxon.DateTime.fromISO(locals[1]).setLocale(CS50.locale);

            // Options for formatting start
            const opts = {
                day: CS50.local.day,
                hour: CS50.local.hour,
                hour12: CS50.local.hour12,
                minute: CS50.local.minute,
                month: CS50.local.month,
                weekday: CS50.local.weekday,
                year: CS50.local.year
            };

            // If start and end on different dates or if clocks change between start and end
            if (start.toLocaleString(luxon.DateTime.DATE_SHORT) !== end.toLocaleString(luxon.DateTime.DATE_SHORT) ||
                start.toLocal().offsetNameLong !== end.toLocal().offsetNameLong) {

                // Add time zone to start
                opts.timeZoneName = CS50.local.timeZoneName;
            }

            // If start and end on same date (and English locale), or if end on midnight of start
            if (CS50.locale === 'en' && (
                start.toLocaleString(luxon.DateTime.DATE_SHORT) === end.toLocaleString(luxon.DateTime.DATE_SHORT) ||
                end.toLocaleString(luxon.DateTime.TIME_24_WITH_SECONDS) === '24:00:00' &&
                    start.toLocaleString(luxon.DateTime.DATE_SHORT) == end.minus({days: 1}).toLocaleString(luxon.DateTime.DATE_SHORT))) {

                // Format end without date
                html = start.toLocaleString(opts) + ' – ' + end.toLocaleString({
                    hour: CS50.local.hour,
                    hour12: CS50.local.hour12,
                    minute: CS50.local.minute,
                    timeZoneName: CS50.local.timeZoneName
                });
            }

            // If start and end on different dates
            else {

                // Format end without date
                html = start.toLocaleString(opts) + ' – ' + end.toLocaleString({
                    day: CS50.local.day,
                    hour: CS50.local.hour,
                    hour12: CS50.local.hour12,
                    minute: CS50.local.minute,
                    month: CS50.local.month,
                    timeZoneName: CS50.local.timeZoneName,
                    weekday: CS50.local.weekday,
                    year: CS50.local.year
                });
            }
        }
        else {

            // Parse start
            const start = luxon.DateTime.fromISO(locals[0]).setLocale(CS50.locale);

            // Format start
            html = start.toLocaleString({
                day: CS50.local.day,
                hour: CS50.local.hour,
                hour12: CS50.local.hour12,
                minute: CS50.local.minute,
                month: CS50.local.month,
                timeZoneName: CS50.local.timeZoneName,
                weekday: CS50.local.weekday,
                year: CS50.local.year
            });
        }

        // Display HTML
        $(this).html(html);
    });

    // Enable tooltips
    const enableTooltips = function() {
        $('[data-bs-toggle="tooltip"]').each(function(index, element) {
            new bootstrap.Tooltip(element);
        });
    };
    enableTooltips();

    // Re-attach tooltips after tables have responded
    // https://github.com/wenzhixin/bootstrap-table/issues/572#issuecomment-76503607
    $('table').on('post-body.bs.table', function() {
        enableTooltips();
    });

    // Ensure tables are responsive
    // https://bootstrap-table.com/docs/extensions/mobile/
    $('table').each(function(index, element) {

        // Workaround for https://github.com/wenzhixin/bootstrap-table/issues/5470
        $(element).find('thead td, thead th').each(function(index, element) {
            if ($(element).css('text-align')) {
                $(element).wrapInner('<div style="text-align: ' + $(element).css('text-align') + '">');
            }
        });

        // Enable bootstrap-table
        try {
            $(element).bootstrapTable({
                classes: 'table table-bordered table-striped',
                minWidth: 992, // https://getbootstrap.com/docs/5.0/layout/breakpoints/#available-breakpoints
                mobileResponsive: true,
                onPostBody: function(data) {

                    // Left-align cards on mobile
                    $(element).find('.card-view-title, .card-view-title > *, .card-view-value').css('text-align', 'left');
                }
            });
        }
        catch(err) {} // In case no thead
    });

    // data-marker
    $('[data-marker]').each(function(index, element) {

        // Add .fa-ul to parent ul
        $(element).parent().addClass('fa-ul');

        // Filter
        const filter = function() {
            return !$(this).is('ol, ul');
        };

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
                    $(element).find('> .fa-li > .fa-plus-square').removeClass('fa-plus-square').addClass('fa-minus-square');
                }
                else if (marker === '-') {
                    $(element).attr('data-marker', '+');
                    $(element).find('> .fa-li > .fa-minus-square').removeClass('fa-minus-square').addClass('fa-plus-square');
                }
                $(window).trigger('resize');
            }
        };

        // Icons
        const plus = $('<span class="fa-li"><i class="far fa-plus-square"></i></span>').click(click);
        const minus = $('<span class="fa-li"><i class="far fa-minus-square"></i></span>').click(click);
        const square = $('<span class="fa-li"><i class="fas fa-square"></i></span>');

        // Wrapper
        const $span = $('<span>').click(click);

        // If +
        if ($(element).attr('data-marker') === '+') {
            $(element).contents().filter(filter).wrap($span);
            $(element).prepend(plus);
        }

        // If -
        else if ($(element).attr('data-marker') === '-') {
            $(element).contents().filter(filter).wrap($span);
            $(element).prepend(minus);
        }

        // If *
        else if ($(element).attr('data-marker') === '*') {
            $(element).prepend(square);
        }
    });

    // Also add .fa-ul to TOC, if any, for consistency
    $('.markdown-toc').addClass('fa-ul');

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
            $('html, body').animate({scrollTop: bottom + 1}, 500);

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

    // Convert Jekyll's code blocks to Mermaid's format
    $('code[class="language-mermaid"]').each(function(index, element) {

        // Replace pre > code with div
        const $element = $(element);
        const $div = $('<div class="mermaid">').text($element.text());
        $div.attr('data-original-code', $element.text()); // https://github.com/mermaid-js/mermaid/issues/1945#issuecomment-1661264708
        $element.parent().replaceWith($div);
    });
    (function() {

        // Allow for theme changing
        const init = function() {

            // Render chart
            const theme = (window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'default';
            $('div.mermaid').each(function(index, element) {

                // Workaround for now, per https://github.com/mermaid-js/mermaid/issues/1945#issuecomment-1661264708
                $(element).removeAttr('data-processed');
                $(element).html($(element).attr('data-original-code'));

                // (Re-)initialize chart
                mermaid.init({theme: theme}, element);

                // Left-align Mermaid, until https://github.com/mermaid-js/mermaid/issues/1983
                // https://stackoverflow.com/a/6322799/5156190
                $(element).children('svg').attr('preserveAspectRatio', 'xMinYMin meet');
            });
        };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', init);
        init();
    })();

    // Render Scratch blocks
    scratchblocks.renderMatching('pre code.language-scratch', {
        scale: 0.675,
        style: 'scratch3'
    });

    // Remove PRE wrapper, since not actually preformatted text
    $('pre code.language-scratch').each(function(index, element) {
        $(element).parent().replaceWith($(element).children());
    });

    // Get headings
    const headings = $([
        'main h1',
        'main h2',
        'main h3',
        'main h4',
        'main h5',
        'main h6'].join(','));
    headings.each(function(index, element) {

        // If it has an id
        if ($(element).attr('id')) {

            // Link heading's children to heading (unless already linked)
            $(element).contents().each(function(index, node) {
                if (!$(node).is('a')) {
                    $(node).wrapAll($('<a data-id href="#' + $(element).attr('id') + '"></a>'));
                }
            });

            // Relocate id to an anchor (so that it can be invisibly positioned below any alert)
            // https://stackoverflow.com/a/13184714
            $(element).before($('<a data-id id="' + $(element).attr('id') + '"></a>'))
            $(element).removeAttr('id');
        }
    });

    // Listen for hashchange
    $(window).on('hashchange', function() {

        // Find heading
        let heading;
        try {
            heading = $(window.location.hash); // In case syntactically invalid ID
        }
        catch (err) {
            return false;
        }
        if (!heading.length) {
            return false;
        }

        // Previous siblings
        heading.prevAll().removeClass('next').find('[data-next]').prop('disabled', true);

        // This heading
        heading.removeClass('next');

        // Next siblings
        next(heading).removeClass('next');
    });
    $(window).trigger('hashchange');

    // Listen for resize
    $(window).on('resize', function() {

        // Return true iff small device (on which aside will be above main)
        const mobile = function() {
            return $('aside').position().top < $('main').position().top;
        };

        // Get headings
        const headings = $([
            'main h1:not(.next)',
            'main h2:not(.next)',
            'main h3:not(.next)',
            'main h4:not(.next)',
            'main h5:not(.next)',
            'main h6:not(.next)'].join(','));

        // Ensure last heading, if any, can be anchored atop page
        if (headings.last().offset()) {
            var top = headings.last().offset().top;
        }
        else {
            var top = 0;
        }

        // On small devices
        if (mobile()) {
            var margin = $(window).height() - ($('main').outerHeight() + $('aside').outerHeight() - top);
        }

        // On large devices
        else {
            var margin = $(window).height() - ($('main').outerHeight() - top);
        }

        // Update margin
        $('main').css('margin-bottom', Math.max(0, Math.ceil(margin)) + 'px');

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

        // Calculate height of alert, if any
        const height = $('#alert').outerHeight(true) || 0;

        // Position aside
        if (mobile()) {
            $('aside').css('height', '');
            $('aside').css('margin-top', height + 'px');
            $('aside').css('top', '');
            $('main').css('margin-top', '');
        }
        else {
            $('aside').css('height', ($(window).height() - height) + 'px');
            $('aside').css('margin-top', '');
            $('aside').css('top', height + 'px');
            $('main').css('margin-top', height + 'px');
        }

        // Position headings' anchors below alert
        // https://stackoverflow.com/a/13184714
        $('a[data-id][id]').css('top', '-' + height + 'px');

    });
    $(window).trigger('resize');

    // Resize iframes dynamically
    $('iframe').on('load', function() {
        $(this).iFrameResize();
    });

    // Parse emoji
    twemoji.parse(document.body);

    // Reveal page
    $('body').removeClass('invisible');
});
