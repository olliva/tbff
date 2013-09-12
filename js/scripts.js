(function(doc) {
        var viewport = document.getElementById('viewport');
        if ( navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
            doc.getElementById("viewport").setAttribute("content", "width=device-width, initial-scale=0.5, maximum-scale=0.5");
        } else if ( navigator.userAgent.match(/iPad/i) ) {
            doc.getElementById("viewport").setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");
        }
}(document));



$(function(){

    //функция инициализации ротатора
    jQuery.fn.nRotator = function (options){
        var s = jQuery.extend({ //опции по умолчанию, которые используются, если не были переданы другие
           arrows: true, //показывать ли стрелки вперед/назад
           points: true, //показывать ли точки навигации по кадрам
           numbers: false, //отображать ли номера кадров внутри точек навигации
           loop: true, //закольцовывать ли прокрутку кадров (после последнего снова будет первый или прокрутка остановится)
           interval: 5000, //время автоматической смены кадров (false - автоматическая смена отключена), миллисекунд
           speed: 500, //время перемотки на нужный кадр, миллисекунд
           animation: 'slide', //тип анимации; fade - затухание, slide - перемотка в сторону
           random: false,
           counter: false
        }, options);
        //назначаем переменные для основных блоков, считаем количество кадров, назначаем служебные классы основным блокам
        var p = $(this).addClass('nr-container');  
        var main = p.find('ul').addClass('nr-main');
        var amount = main.find('li').size();    
        if (s.random == true) main.css({visibility: 'hidden'});
        p.children('div').addClass('nr-overflow');
        //проверяем настройки и количество кадров, выводим стрелки
        if (s.arrows == true && amount > 1) {
            p.append('<a href="javascript:void(0)" class="nr-prev" rel="prev"></a><a href="javascript:void(0)" class="nr-next" rel="next"></a>');
            if (s.loop == false) p.find('.nr-prev').addClass('disabled');
        }
        //проверяем настройки, выводим навигационные точки (с номерами кадров или без)
        if (s.points) {
            var pointsStr = '';
            for(i = 1; i <= amount; i++) {
                pointsStr += '<li><a href="javascript:void(0);" rel="'+ i +'">';
                if (s.numbers == true) pointsStr += i;
                pointsStr += '</a>';                
            }
            p.append('<ul class="nr-points">'+ pointsStr +'</ul>');
        }       
        //помечаем как активные первый кадр ротатора и первую навигационную точку
        var rnd = s.random == true ? Math.floor(Math.random() * (amount)) : 0;
        p.find('.nr-main li:eq('+rnd+'), .nr-points li:eq('+rnd+')').addClass('active');  
        //проверяем настройки, выводим счетчик кадров (n/m)
        if (s.counter) {
            p.append('<span class="nr-counter"></span>');
            p.find('.nr-counter').html(rnd + 1 + '/' + main.children('li').size());
        }               
        var intervalStop = false; //переменная-стоппер для смены кадров
        p.find('.nr-main, .nr-prev, .nr-next, .nr-points').on('mouseenter', function(){
            intervalStop = true; //при наведении мыши на ротатор останавливаем смену кадров
        }).on('mouseleave', function(){
            intervalStop = false; //если курсор убрали с ротатора, стоппер убирается
        });
        //проверяем настройки, запускаем автоматическую смену кадров
        if (s.interval != false) {
            var t = setInterval(function(){
                if (intervalStop == false) p.nRotatorMove(s, 'next');
            }, s.interval);
        }
        //по клику на стрелкам или навигационным точкам запускаем смену кадра
        p.on('click', '.nr-prev, .nr-next, .nr-points a', function(){
            if ($(this).hasClass('disabled') == false) p.nRotatorMove(s, $(this).attr('rel'));
            if (s.interval) {
                intervalStop = true;
                setTimeout(function(){
                    intervalStop = false;
                }, s.interval);                
            }
        });
        p.on('swipe', function(e, Dx, Dy){
            if (Dx < 0) p.nRotatorMove(s, 'next');
            if (Dx > 0)  p.nRotatorMove(s, 'prev');
            if (s.interval) {
                intervalStop = true;
                setTimeout(function(){
                    intervalStop = false;
                }, s.interval);                
            }            
       });        

        if (s.random) {
            p.nRotatorMove(s, 'next');
            setTimeout(function(){
                main.css({visibility: 'visible'});    
            }, s.speed);
        }
        
    };
    
    //функция движения кадров ротатора
    jQuery.fn.nRotatorMove = function (s, target){ 
        //назначаем переменные для основных блоков, считаем количество кадров
        var main = $(this).find('.nr-main');
        var active_id = main.find('li.active').index() + 1;
        var amount = main.find('li').size();
        if (target != 'prev' && target != 'next') target_id = target; //если id нужного кадра цифровой - то сразу используем его
        else { //если нет, то определяем нужный id отнимая или добавляя 1 от активного id
            if (target == 'prev') target_id = active_id - 1;
            else target_id = active_id + 1;
        }
        if (target_id > amount) { //если id больше количества пунктов - либо никуда не двигаем, либо возвращаем на первый пункт, в зависимости от настроек
            if (s.loop == false) target_id = amount;
            else target_id = 1;
        }
        if (target_id < 1) { //если id меньше 1 - либо никуда не двигаем, либо перематываем на последний пункт, в зависимости от настроек
            if (s.loop == false) target_id = 1;
            else target_id = amount;
        }       
        //удаляем и назначаем класс active нужным элементам
        $(this).find('li:nth-child('+ target_id +')').addClass('active').siblings().removeClass('active');
        var target_pos = main.find('li:nth-child('+ target_id +')').position().left * -1;
        if (s.counter) {
            $(this).find('.nr-counter').html(target_id + '/' + main.children('li').size());
        }
        //если закольцовывание кадров отключено, то в начале и конце списка блокируем соответствующие стрелки
        if (s.loop == false) {
            $(this).find('.nr-prev, .nr-next').removeClass('disabled');
            if (target_id == 1) $(this).find('.nr-prev').addClass('disabled');
            if (target_id == amount) $(this).find('.nr-next').addClass('disabled');
        }
        //анимация движения ротатора
        //анимация движения ротатора в зависимости от настроек
        if (s.animation == 'slide') {
            var target_pos = main.find('li:nth-child('+ target_id +')').position().left * -1;
            main.animate({
                'left': target_pos+'px'
            }, {queue: false}, s.speed);
        }        
        if (s.animation == 'fade') {
            main.find('li:visible').not('active').fadeOut(s.speed);
            main.find('li.active').fadeIn(s.speed);
        }                
    }
});


$(function() {

    //инициализация слайдера на главной странице
    if ($('.banners').size() > 0 ) {
        $('.banners').nRotator({
            points: false,
            loop: false,
            animation: 'slide',
            speed: 300,
        });        
    }
    //инициализация слайдера на карточке товара - фотографии
    if ($('.product-photo').size() > 0 ) {
        $('.product-photo').nRotator({
            loop: false,
            animation: 'slide',
            speed: 300
        });        
    }
    //инициализация слайдера на карточке товара - "вы уже смотрели"
    if ($('.product .history-list').size() > 0 && $(document).width() < 600) {
        $('.product .history-list').nRotator({
            loop: false,
            points: false,
            animation: 'slide',
            speed: 300,
            interval: false,
            counter: true
        });        
    }
    //инициализация слайдера на карточке товара - "также в этом луке"
    if ($('.product .same-look-list').size() > 0 && $(document).width() < 600) {
        $('.product .same-look-list').nRotator({
            loop: false,
            points: false,
            animation: 'slide',
            speed: 300,
            interval: false,
            counter: true            
        });        
    }

    //нестандартный скролл для главного меню
    var jspSettings = {
        verticalGutter: 0,
        autoReinitialise: true
    }
    var api = $('.main-menu').jScrollPane(jspSettings).data('jsp');
    var apiFilter = $('.filter-scroll').jScrollPane(jspSettings).data('jsp');        
    $('.main-menu, .filter-scroll').on('jsp-scroll-y', function(){
        $('.jspDrag').css({visibility: 'visible'});
        $('.jspDrag').attr('data-last-scroll', new Date().getSeconds());
    });

    //проверка, давно ли прокручивалось меню, если да - скрываем скролл
    function scrollCheck(){
        if ($('.jspDrag').attr('data-last-scroll') != new Date().getSeconds()) $('.jspDrag').css({visibility: 'hidden'});
    }
    setInterval(function(){
        scrollCheck();
    }, 2000);
    scrollCheck();

    //открытие/закрытие главного меню на маленьких разрешениях
    $('.menu-switcher, .catalog-content-filter').on('click', function(){
        $('.logo, .nav-overlay').toggle();
        $('.menu-switcher').toggleClass('active');
        $('.main-menu-container').slideToggle(200);
        setTimeout(function(){
            api.reinitialise(); 
            apiFilter.reinitialise();
        }, 200);
    });
    //закрытие меню/фильтров при клике на остальном контенте
    $('.nav-overlay').on('click', function(){
        $('.menu-switcher').trigger('click');
    });

    //скрытие/открытие блоков в подвале сайта на маленьких разрешениях
    $('.social-expand, .footer-menu-expand').on('click', function(){
        var t = $(this);
        var ul = t.next('ul').slideToggle(200);    
        setTimeout(function(){
            if (ul.is(':visible')) t.addClass('open').removeClass('close');
            else  t.addClass('close').removeClass('open');
        }, 300);
    });

    //фильтр в каталоге
    //служебный атрибут, для простого удаления выбранных в фильтре значений
    var counter_1 = 0;
    $('.catalog-filter').each(function(){
        var counter_2 = 0;
        $(this).find('.list li').each(function(){
            $(this).attr('data-filter-id', counter_1 + '-' + counter_2);
            counter_2++;
        })    
        counter_1++;
    });
    //переключатель "мужское/женское"    
    $('.filter-gender a').on('click', function(){
        $(this).addClass('active').siblings().removeClass('active');    
        return false;
    });
    //открытие категорий/размеров/цветов
    $('.catalog-filter .name').on('click', function(){
        $(this).parents('.catalog-filter').toggleClass('active').siblings().removeClass('active');    
    });
    //удаление выбранного фильтра
    $('.catalog-filter .selected, .catalog-content-filter').on('click', 'a', function(){
        $(this).parent().remove();
    });    
    //функция удаления определенного фильтра
    function catFilterDel(p){
        var id = p.attr('data-filter-id');
        $('.catalog-filter .selected, .catalog-content-filter').find('[data-filter-id=' + id + ']').remove();
        $('.catalog-filter .list').find('[data-filter-id=' + id + ']').removeClass('active');
    };
    //клик по определенному фильтру
    $('.catalog-filter .list').on('click', 'a', function(){
        var p = $(this).parent();
        var selected = p.parents('.catalog-filter').find('.selected');        
        var selected2 = $('.catalog-content-filter').find('ul');        
        if (!p.is('.more, .less')) {        //если это не сворачивание и разворачивание полного списка категорий, то..
            if (!p.is('.active')) {         //добавляем выбранное значение
                p.clone().appendTo(selected).find('ul').remove();
                p.clone().appendTo(selected2).find('ul').remove();
                p.addClass('active');            
                if (p.parents('li.active').size() > 0) catFilterDel(p.parents('li.active'));
                p.find('li.active').each(function(){
                    catFilterDel($(this));    
                });
            }
            else catFilterDel(p);            //или удаляем его
        }
        else {
            if (p.is('.more')) p.hide().siblings().show();
            else p.siblings('.more').show().nextAll('li').hide();
        }
        return false;
    });        
    //клик по выюранному фильтру при свернутой категории (его удаление)
    $('.catalog-filter .selected').on('click', 'a', function(){
        catFilterDel($(this).parent());
        return false;
    });            
    $('.catalog-content-filter').on('click', 'li', function(){
        catFilterDel($(this));
        return false;
    });            

    //переключение между меню и фильтром в сайдбаре
    $('.menu-filter-switcher').on('click', function(){
        $('.main-menu-container').toggleClass('nav-hidden');
        $('.menu-switcher span').toggle();   
        if ($('.main-menu-container:visible .search').size() == 0) $('.main-menu-container:visible').prepend($('.search'));
    });

    //открытие попапа
    var speed = 100; //скорость появления/затухания попапа

    function popupOpen(id){
        var p = $('#'+id);
        if (p.is(':hidden')) { //определяем нужный попап, убираем другие открытые окна, фиксируем положение основного контента, чтобы он не прокручивался вместе с попапом
            if (p.hasClass('inner-popup')) var o = p.siblings('.inner-overlay');
            else {
                if (p.is('.cart')) var o = $('.cart-overlay');
                else if (p.is('.product')) var o = $('.product-overlay');
                else var o = $('.overlay[class=overlay]');
                $('.popup').filter(':visible').fadeOut(speed);
                $('.overlay').not(o).fadeOut(speed);
                if (o.is(':hidden')) {
                    var t = $(document).scrollTop() * -1;
                    $('.page').addClass('popup-over').css({top: t}).attr('data-scroll', t);                                    
                }
            }
            if (o.is(':hidden')) o.fadeIn(speed);
            p.css({
                display: 'block',
                opacity: 0
            });
            //если попап меньше высоты окна, то выравниваем его по середине
            if (p.height() < $(window).height() && p.hasClass('inner-popup') == false) p.css({top: '50%', marginTop: -1 * p.outerHeight() / 2});
            else  p.removeAttr('style');
            //если разрешение маленькое и попап всплывает под навигационной панелью, сдвигаем его ниже
            if (p.offset().top < $('.nav').height() && $(window).width() < 1015 && !p.is('.cart')) {
                p.css({top: $('.nav').height(), marginTop: 0});
                $('html, body').scrollTop(0);
            }
            p.css({
                display: 'block',
                opacity: 0
            });        
            p.animate({
                opacity: 1
            }, speed);                
        }
    };
    function popupClose(inner){
        if (inner) {
            $('.inner-overlay').fadeOut(speed);
            $('.inner-popup:visible').fadeOut(speed);
        }
        else {
            $('.overlay, .inner-overlay').fadeOut(speed);
            $('.popup:visible').fadeOut(speed);
            $('.page').removeClass('popup-over').removeAttr('style');
            $('html, body').scrollTop($('.page').attr('data-scroll') * -1);
        }
    };
    //открытие попапа при клике на элементе, его открывающем
    $('[data-popup-open]').on('click', function(){
        var id = $(this).attr('data-popup-open');
        popupOpen(id);
        if (id == 'product' && $('.menu-switcher span').is(':visible')) {
            $('.main-menu-container').toggleClass('nav-hidden').hide();
            $('.menu-switcher span').toggle();   
        }
        return false;
    });
    //закрытие попапа 
    $('body').on('click', '.overlay, .popup .popup-close', function(){
        console.log('df');
        popupClose(false);
        return false;
    });
    $('body').on('click', '.inner-overlay, .inner-popup .popup-close', function(){
        popupClose(true);
        return false;
    });    
    //открытие скрытого блока
    function blockOpen(id, hide){
        $('#'+id).show();
        if (hide) hide.hide();
    };
    $('[data-block-open]').on('click', function(){
        var id = $(this).attr('data-block-open');
        if ($(this).is('[data-hide-it]')) var hide = $(this);
        else hide = false;
        blockOpen(id, hide);
        return false;
    });

    //переключение табов
    $('.tabs a').on('click', function(){
        var p = $(this).parent();
        var id = p.parent().find('li').index(p);
        if (p.not('.active')) $(this).parent().addClass('active').siblings().removeClass('active');
        var target = $(this).parents('.tabs').next('.tabs-content');
        target.find('li').eq(id).show().siblings().hide();
        return false;   
    });

    //переключение сортировки в каталоге
    $('.catalog-sort').on('click', '.item', function(){
        if ($(this).is('.active')) $(this).find('span').toggleClass('sort-up sort-down');
        else $(this).addClass('active').siblings().removeClass('active');
        return false;
    });


    //фильтры в карточке товаров
    $('body').on('click', '.product .size-list a, .product .color-list a', function(){
        $(this).parent().toggleClass('active');
        return false;
    });

    //открытие большого изображения из карточки товара 
    $('body').on('click', '.product-photo .plus', function(){
        var img = $(this).parents('.product-photo').find('.list .active img').attr('data-big-img');
        window.location = img;
    });

    //открытие формы поиска в навигации
    $('.nav .ico-search').on('click', function(){
        $(this).parent().toggleClass('active');
        $('.search').toggleClass('active');
        if ($('.main-menu-container:visible .search').size() == 0) $('.main-menu-container:visible').prepend($('.search'));
        if ($(window).width() < 1015) $('.nav').append($('.search'));
        if ($('.search').is('.active')) {
            $('.search input').focus();
            if ($(window).width() < 600) $('.nav').css({height: 120});
        }
        else {
            if ($(window).width() < 600) $('.nav').css({height: 60});
        }
        return false;
    });

    //добавление товара в корзину
    function cartItemAddSuccess(button){
        $('.product .button-buy').addClass('button-disabled');
        if ($(window).width() > 767) $('.item-added-to-cart').fadeIn(300);
        else {
            popupOpen('item-added-to-cart-full');    
            var t = button.offset().top - $('#item-added-to-cart-full').outerHeight() - 100;
            $('#item-added-to-cart-full').css({top: t + 'px'});
        }
    }
    $('body').on('click', '.product .button-buy', function(){
        cartItemAddSuccess($(this));
        return false;
    });
    $('body').on('click', '.item-added-to-cart', function(){
        $(this).fadeOut(300);
    });

    //удаление товара из корзины
    function cartItemDel(p){
        p.animate({
            height: 0
        }, {
            duration: 300,
            complete: function(){
                p.remove();
            }
        })
    }
    $('.cart-list .del').on('click', function(){
        cartItemDel($(this).parents('li'));
    });

    //начало редактирования товара в корзине
    function cartItemEditStart(p) {
        var item = p;
        var p = p.clone().addClass('editing').insertBefore(item);
        item.css({height: p.height()});
        //определение выбранных размеров
        p.find('.cart-item-size+dd .static').each(function(){
            var size = $(this).html();
            p.find('.size-list li').each(function(){
                if (size == $(this).find('a').html()) $(this).addClass('active');
            });    
        });
        //определение выбранного количества
        p.find('.cart-item-count+dd .static').each(function(){
            var count = $(this).html();
            p.find('.cart-item-count+dd option').each(function(){
                if (count == $(this).html()) $(this).attr('selected', 'selected');
            });    
        });        
        p.addClass('editing');
    }
    $('.item-edit-start').on('click', function(){
        cartItemEditStart($(this).parents('li'));
    });
    //выделение активных размеров при редактировании товара в корзине
    $('.cart-list').on('click', '.size-list a', function(){
        $(this).parent().toggleClass('active');
        return false;
    });

    //отмена редактирования товара в корзине
    function cartItemEditCancel(p) {
        var item = p.next('li');
        item.css('height', 'auto');
        p.remove();
    }    
    $('.cart-list').on('click', '.item-edit-cancel', function(){
       cartItemEditCancel($(this).parents('li'));
    });    
    //сохранение изменений при редактировании товара в корзине
    function cartItemEditSave(p) {
        var item = p.next('li');

        //сохранение размеров
        item.find('.cart-item-size+dd .static').remove();
        $(p.find('.size-list .active a').get().reverse()).each(function(){
            item.find('.cart-item-size+dd').prepend(' <span class="static">' + $(this).html() + '</span>');    
        });

        //сохранение количества 
        item.find('.cart-item-count+dd .static').html(p.find('.cart-item-count+dd select option:selected').html());
        
        item.css('height', 'auto');
        p.remove();
    }    
    $('.cart-list').on('click', '.item-edit-save', function(){
       cartItemEditSave($(this).parents('li'));
    });    

    //прокрутка блока "рекомендуем" на главной странице
    function contentCarouselInit(){
        var rc = $('.recommended-content-wrap:visible .recommended-content');
        var itemW = rc.find('li:first-child').outerWidth();
        var scroll = parseInt($('.recommended-content-wrap').outerWidth() / itemW);
        if (scroll > 1) scroll--;
        rc.jcarousel({
            itemFallbackDimension: itemW,
            scroll: scroll
        });
        rc.on('swipe', function(e, Dx, Dy){
            if (Dx < 0) rc.jcarousel('next');
            if (Dx > 0) rc.jcarousel('prev');
            if (s.interval) {
                intervalStop = true;
                setTimeout(function(){
                    intervalStop = false;
                }, s.interval);                
            }            
       });                
    }
    contentCarouselInit();

    //переключение табов в разделе "рекомендуем"
    $('.recommended-switcher a').on('click', function(){
        var p = $(this).parent();
        if (p.not('.active')) {
            $(this).parent().addClass('active').siblings().removeClass('active');
            var id = $(this).attr('data-open');
            $('#' + id).show();
            $('.recommended-content-wrap').not('#'+id).hide();
            contentCarouselInit();
        }
        return false;   
    })
    
    //открытие блока с условиями доставки                     временное
    $('.delivery-form button').on('click', function(){
        $('.delivery-results').show();
        return false;
    });

});