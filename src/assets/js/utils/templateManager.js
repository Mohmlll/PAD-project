
/**
 * Implementation of a template manager that handles ppage  events
 */
class TemplateManager {

    setActiveState(){
        const currentController = app.getHash();

        $(`.main-nav a[data-controller]`).removeClass('active')
        $(`.main-nav a[data-controller='${currentController}']`).first().addClass('active')
    }

    initPage() {
        // Scroll animation init
        window.sr = new scrollReveal();

        // Home seperator
        if($('.home-seperator').length) {
            $('.home-seperator .left-item, .home-seperator .right-item').imgfix();
        }

        // Home number counterup
        // if($('.count-item').length){
        //     $('.count-item strong').counterUp({
        //         delay: 10,
        //         time: 1000
        //     });
        // }


        // Page loading animation
        $(window).on('load', function() {
            if($('.cover').length){
                $('.cover').parallax({
                    imageSrc: $('.cover').data('image'),
                    zIndex: '1'
                });
            }

            $("#preloader").animate({
                'opacity': '0'
            }, 600, function(){
                setTimeout(function(){
                    $("#preloader").css("visibility", "hidden").fadeOut();
                }, 300);
            });

            $("a[data-scroll-to]").on('click', function () {
                let scroll_to = $(this).attr('data-scroll-to')
                let scroll_to_element = $(`#${scroll_to}`);

                if (scroll_to_element.length > 0) {
                    templateManager.scrollTo(scroll_to_element, $(this))
                }
            })
        });


    }

    scrollTo(target, button){
        $(document).off("scroll");

        $('a').each(function () {
            $(this).removeClass('active');
        })
        button.addClass('active');

        $('html, body').stop().animate({
            scrollTop: (target.offset().top) - 130
        }, 500, 'swing', function () {
            $(document).on("scroll", templateManager.onScroll);
        });
    }

    initSideBar(){
        // Window Resize Mobile Menu Fix
        this.mobileNav();

        // Menu Dropdown Toggle
        if($('.menu-trigger').length){
            $(".menu-trigger").on('click', function() {
                $(this).toggleClass('active');
                $('.header-area .nav').slideToggle(200);
            });
        }

        $(document).ready(function () {
            $(document).on("scroll", templateManager.onScroll);
        });

        // Window Resize Mobile Menu Fix
        $(window).on('resize', function() {
            templateManager.mobileNav();
        });
    }

    onScroll(event){
        var scrollPos = $(document).scrollTop();
        $('.nav a').each(function () {
            var currLink = $(this);
            var refElement = $(currLink.attr("href"));
            if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
                $('.nav ul li a').removeClass("active");
                currLink.addClass("active");
            }
            else{
                currLink.removeClass("active");
            }
        });
    }

    mobileNav() {
        var width = $(window).width();
        $('.submenu').on('click', function() {
            if(width < 992) {
                $('.submenu ul').removeClass('active');
                $(this).find('ul').toggleClass('active');
            }
        });
    }
}