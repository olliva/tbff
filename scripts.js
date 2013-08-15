(function(doc) {
    var viewport = doc.getElementById('viewport');
    if (viewport != null)
    {
        if ( navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
            //viewport.setAttribute("content", "width=device-width, initial-scale=0.5, maximum-scale=0.5");
        } else if ( navigator.userAgent.match(/iPad/i) ) {
            viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1");
        }
    }
}(document));

var updateLiveOrderForm = function() {
    var request = getOrderingForm();
    request.done(function(xhr) {
        $("#cart-popup").html(xhr);
    });
};

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

    //инициализация слайдера на карточке товара - "вы уже смотрели"
    if ($('.product .history-list').size() > 0 && $(document).width() < 600) {
        $('.product .history-list').nRotator({
            loop: true,
            points: false,
            animation: 'fade',
            speed: 300,
            interval: false,
            counter: true
        });
    }
    //инициализация слайдера на карточке товара - "также в этом луке"
    if ($('.product .same-look-list').size() > 0 && $(document).width() < 600) {
        $('.product .same-look-list').nRotator({
            loop: true,
            points: false,
            animation: 'fade',
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
            if (typeof api != "undefined")
                api.reinitialise();
            if (typeof apiFilter != "undefined")
                apiFilter.reinitialise();
        }, 200);
    });
    //закрытие меню/фильтров при клике на остальном контенте
    $('.nav-overlay').on('click', function(){
        $('.menu-switcher').trigger('click');
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
//        return false;
    });
    //клик по выюранному фильтру при свернутой категории (его удаление)
    $('.catalog-filter .selected').on('click', 'a', function(){
        catFilterDel($(this).parent());
//        return false;
    });
    $('.catalog-content-filter').on('click', 'li', function(){
        catFilterDel($(this));
//        return false;
    });

    //переключение между меню и фильтром в сайдбаре
    $(document).on('click', '.menu-filter-switcher', function(){
        $('.main-menu-container').toggleClass('nav-hidden');
        $('.menu-switcher span').toggle();
        if ($('.main-menu-container:visible .search').size() == 0) $('.main-menu-container:visible').prepend($('.search'));
    });

    //открытие попапа
    var speed = 100; //скорость появления/затухания попапа

    function popupOpen(id){
        var p = $('#'+(id == "ordering" ? "cart-popup" : id));

        if (p.is(':hidden'))
        { //определяем нужный попап, убираем другие открытые окна, фиксируем положение основного контента, чтобы он не прокручивался вместе с попапом
            p.removeClass("cart-steps");
            if (id == "ordering")
                p.addClass("cart-steps");

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
    $(document).on('click', '[data-popup-open]', function () {
        var self = $(this),
            id = self.attr('data-popup-open'),
            request = null;

        if (self.hasClass(productLoaderClass))
            return false;

        var parentSelf = self.parent(".catalog-item");
        if (parentSelf.length) {
            if (parentSelf.hasClass(productLoaderClass))
                return false;

            parentSelf.addClass(productLoaderClass);
        }
        else
        {
            self.addClass(productLoaderClass);
        }

        if (id == 'cart-popup') {
            request = getCart();

            request.done(function (data) {
                $("#" + id).html(data);
                popupOpen(id);
                self.removeClass(productLoaderClass);
            });
        }
        else if (id == 'product') {
            request = getProductCard(self.attr("href"));

            request.done(function (data) {
                $("#" + id).html(data);
                popupOpen(id);
                self.removeClass(productLoaderClass);
                if (parentSelf.length)
                    parentSelf.removeClass(productLoaderClass);

                if ($('.menu-switcher span').is(':visible')) {
                    $('.main-menu-container').toggleClass('nav-hidden').hide();
                    $('.menu-switcher span').toggle();
                }

                if ($('.product-photo').size() > 0 ) {
                    $('.product-photo').nRotator({
                        loop: false,
                        animation: 'slide',
                        speed: 300
                    });
                }
            });
        }
        else if (id == 'ordering') {
            var
                popupWorkId = "cart-popup",
                option = self.attr("data-popup-option");

            if (typeof option != "undefined" && option.length)
            {
                if (option == "new-user-create")
                {
                    var
                        formData = $("#new-user-form"),
                        requestRegistration = $.ajax({
                            url: "/ajax/registration.php",
                            type: "POST",
                            data: formData.serialize(),
                            dataType: "json"
                        });

                    requestRegistration.done(function(xhrReg) {
                        if (xhrReg.result == "success")
                        {
                            getOrderingForm().done(function(xhr) {
                                $("#" + popupWorkId).html(xhr);
                                popupOpen(id);
                                self.removeClass(productLoaderClass);
                            });
                        }
                        else
                        {
                            $("#fastRegError").find(".form_attention").html(xhr.errors.join("<br/>"));
                            $("#fastRegError").show();
                            self.removeClass(productLoaderClass);
                        }
                    });
                }
                else if (option == "redirect") {
                    function badProcess() {
                        alert("Что то пошло не так!:( Повторите оформление заказа...");
                        popupClose(id);
                        self.removeClass(productLoaderClass);
                    }

                    var request = getOrderingForm({dataType:"JSON"});
                    request.done(function(xhr) {
                        if (xhr.order > 0)
                            document.location = "/ordering/success/?order_id="+xhr.order;
                        else
                            badProcess();
                    });
                    request.fail(badProcess);
                }
                else
                {
                    var addressPull = [],
                        address = $("#ORDER_PROP_20");
                    if (address.length && address.attr("type") == "hidden")
                    {
                        // STREET
                        if ($('#ORDER_PROP_51').val().length)
                        {
                            addressPull.push("Улица " + $('#ORDER_PROP_51').val());
                            // HOUSE
                            if ($('#ORDER_PROP_52').val().length)
                            {
                                addressPull.push("Дом " + $('#ORDER_PROP_52').val());
                                // BUILDING
                                if ($('#ORDER_PROP_53').val().length)
                                    addressPull.push("Корпус\\строение " + $('#ORDER_PROP_53').val());
                                // ROOM
                                if ($('#ORDER_PROP_54').val().length)
                                    addressPull.push("Квартира\\офис " + $('#ORDER_PROP_54').val());
                            }
                            else
                                addressPull = [];
                        }
                        address.val(addressPull.join(", "));
                    }

                    $("#ordering-form-mobile").append('<input type="hidden" name="'+option+'" value="true">');
                    getOrderingForm().done(function(xhr) {
                        $("#" + popupWorkId).html(xhr);
                        popupOpen(id);
                        self.removeClass(productLoaderClass);
                    });
                }
            }
            else
            {
                getOrderingForm().done(function(xhr) {
                    $("#" + popupWorkId).html(xhr);
                    popupOpen(id);
                    self.removeClass(productLoaderClass);
                });
            }
        }

        return false;
    });
    //закрытие попапа 
    $(document).on('click', '.overlay, .popup .popup-close', function(){
        popupClose(false);
        return false;
    });
    $('.inner-overlay, .inner-popup .popup-close').off();
    $(document).on('click', '.inner-overlay, .inner-popup .popup-close', function(){
        popupClose(true);
        return false;
    });
    //открытие скрытого блока
    function blockOpen(id, hide){
        $('#'+id).show();
        if (hide) hide.hide();
    };
    $(document).on('click', '[data-block-open]', function(){
        var id = $(this).attr('data-block-open');
        if ($(this).is('[data-hide-it]')) var hide = $(this);
        else hide = false;
        blockOpen(id, hide);
        return false;
    });

    //переключение табов
    $(document).on('click', '.tabs a', function(){
        var p = $(this).parent();
        var id = p.parent().find('li').index(p);
        if (p.not('.active')) $(this).parent().addClass('active').siblings().removeClass('active');
        var target = $(this).parents('.tabs').next('.tabs-content');
        target.find('li').eq(id).show().siblings().hide();

        var type = p.parents("ul").attr("data-tabs-type");
        if (typeof type != "undefined" && type.length)
        {
            if (type == "payment-system")
            {
                $("#pay_system_id").val(p.attr("data-payment-id"));
            }
        }
        return false;
    });

    //переключение сортировки в каталоге
    $(document).on('click', '.catalog-sort .item', function(){
        if ($(this).is('.active')) $(this).find('span').toggleClass('sort-up sort-down');
        else $(this).addClass('active').siblings().removeClass('active');
//        return false;
    });

    //открытие большого изображения из карточки товара 
    $(document).on('click', '.product-photo .plus', function(){
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

    // ===============================
    // Редактирование товара в корзине
    // ===============================

    //начало редактирования товара в корзине
    $(document).on('click', '.item-edit-start', function(){
        var self = $(this),
            element = self.parents('li'),
            editable_id = element.attr("data-product-id"),
            cacheKey = "item"+editable_id;

        if (!(cacheKey in cacheCartItems))
            cacheCartItems[cacheKey] = new tbCartItem(element);

        cacheCartItems[cacheKey].ShowEditForm();
    });
    //отмена редактирования товара в корзине
    $(document).on('click', '.cart-list .item-edit-cancel', function(){
        var self = $(this),
            element = self.parents('li'),
            editable_id = element.attr("data-product-id"),
            cacheKey = "item"+editable_id;

        if (cacheKey in cacheCartItems)
            cacheCartItems[cacheKey].HideEditForm();
    });
    //сохранение изменений при редактировании товара в корзине
    $(document).on('click', '.cart-list .item-edit-save', function(){
        var self = $(this),
            element = self.parents('li'),
            editable_id = element.attr("data-product-id"),
            cacheKey = "item"+editable_id;

        if (cacheKey in cacheCartItems)
            cacheCartItems[cacheKey].Save();
    });
    //удаление товара из корзины
    $(document).on('click', '.cart-list .del', function(){
        var self = $(this),
            element = self.parents('li'),
            editable_id = element.attr("data-product-id"),
            request = getCart({
                remove: editable_id,
                dataType: "JSON"
            }, "/api/cart/delete-item.php");

        self.hide();
        element.addClass("loading");
        request.done(function(res) {
            res = $.parseJSON(res);
            if (res.result)
            {
                updateSmallCart(res.quantity);
                updateCartFooter(res.footer);
                element.animate({
                    height: 0
                }, {
                    duration: 300,
                    complete: function(){
                        element.off().remove();
                    }
                });
            }
            else
                self.show();
        });
    });

    // ===========================
    // добавление товара в корзину
    // ===========================

    $(document).on('click', '.product .button-buy', function(){
        var
            $button = $(this),
            $form = $("#add2cart4m");

        if ($button.hasClass("button-disabled"))
            return false;

        if(!$("#sizeHidden").val().length)
        {
            alert("Сперва укажите размер!");
            return false;
        }

        $button.addClass('button-disabled');
        var request = $.ajax({
            url: $form.attr("action"),
            type: "POST",
            data: $form.serialize(),
            dataType: "json"
        });

        request.done(function(xhr) {
            updateSmallCart(xhr.quantity);
            if (typeof xhr.ERROR != "undefined")
            {
                for(var i in xhr.ERROR)
                    alert(xhr.ERROR[i]);
            }else
            {
                if ($(window).width() > 767)
                    $('.item-added-to-cart').fadeIn(300);
                else
                {
                    popupOpen('item-added-to-cart-full');
                    var t = $button.offset().top - $('#item-added-to-cart-full').outerHeight() - 100;
                    $('#item-added-to-cart-full').css({top: t + 'px'});
                }
            }

        });

        return false;
    });
    $(document).on('click', '.item-added-to-cart', function(){
        $(this).fadeOut(300);
    });

    // ===============
    // карточка товара
    // ===============
    $(document).on("click", ".product .size-list a", function() {
        var
            self = $(this),
            active_class = 'active';

        self.parent().addClass(active_class).siblings().removeClass(active_class);
        $("#sizeHidden").val(self.parent().attr("data-size-id"));
        $("#popup-add-size").html(self.html());
    });

    // =================================
    // подгрузка формы оформления заказа
    // =================================

    $(document).on("change", "#NEW_CITY_NAME", updateLiveOrderForm);

});