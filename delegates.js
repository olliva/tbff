var productLoaderClass = "loading",
    delegatesObjects = {
        cart_small: null
    },
    cacheCartItems = {};

/**
 * Получить корзину
 * @param updateFields
 * @param url
 * @param method
 * @returns {*}
 */
var getCart = function (updateFields, url /* optional */, method /* optional */) {
    cacheCartItems = {};
    var query = {
        url: typeof url != "undefined" ? url : "/cart/",
        dataType: "html"
    };

    if (typeof updateFields != "undefined") {
        $.extend(query, {
            type: typeof method != "undefined" ? method : "POST",
            data: updateFields
        });
    }

    return $.ajax(query);
};

/**
 * Получить карточку товара
 * @param url
 * @param options
 * @returns {*}
 */
var getProductCard = function (url, options /* optional */) {
    if (typeof url != "string")
        return false;

    var query = {
        url: url,
        dataType: "html"
    };

    if (typeof options != "undefined")
        $.extend(query, options);

    return $.ajax(query);
};

/**
 * Возвращает страницу оформления заказа
 * @param $container
 */
var getOrderingForm = function(options /* optional */)
{
    var query = {
            url: "/ordering/",
            dataType: "html"
        },
        isFormAccess = $("#ordering-form-mobile");

    if (isFormAccess.length)
    {
        query.type = "POST";
        query.data = isFormAccess.serialize();
    }

    if (typeof options != "undefined")
        $.extend(query, options);

    return $.ajax(query);
};

/**
 * Обновляет визуальную информацию о корзине в информере
 * @param quantity
 */
var updateSmallCart = function (quantity) {
    if (delegatesObjects.cart_small == null)
        delegatesObjects.cart_small = $("#small-cart-informer");

    quantity = parseInt(quantity);
    delegatesObjects.cart_small.toggleClass("active", quantity > 0);
    delegatesObjects.cart_small.find("span").html(quantity > 0 ? quantity : "");
};

/**
 * Обнволяет значения в футере корзины, с ценой и скидкой
 * @param data
 */
var updateCartFooter = function (data) {
    if (typeof data != "object")
        return false;

    var footer = $("#cart-popup .cart-footer"),
        attribute = "data-footer-item";

    for (key in data)
    {
        var value = data[key],
            elem = footer.find("[" + attribute + "='" + key + "']");

        if (elem.length)
            elem.html(value);
    }
};

/**
 * Объект элемента корзины
 * @param item
 * @param options
 * @returns {boolean}
 */
var tbCartItem = function (item, options /* optional */)
{
    // initialization
    if (typeof item != "object")
        return false;

    // class properties
    this.item = item;
    this.options = {
        item_attr_id: "data-product-id",
        item_attr_editable: "data-edit-element",
        class_static: "static",
        class_editable: "editable",
        class_controls: "controls",
        class_save_button: "item-edit-save",
        class_cancel_button: "item-edit-cancel",
        class_start_button: "item-edit-start",
        class_saving_loader: "loader-for-saving",
        mode_view: "view",
        mode_edit: "edit",
        selector_size: "select[name='size']",
        selector_quantity: "select[name='quantity']",
        url_update_item: "/api/cart/update-item.php"
    };
    this.mode = this.options.mode_view;
    this.saveData = {};

    // item properties
    this.id = null;
    this.controlSizes = null;
    this.controlQuantity = null;

    this._init_ = function()
    {
        // default option
        if (typeof options == "object")
            $.extend(this.options, options);

        this.id = this.item.attr(this.options.item_attr_id);
        this.controlSizes = this.item.find("[" + this.options.item_attr_editable + "=\"size\"]");
        this.controlQuantity = this.item.find("[" + this.options.item_attr_editable + "=\"quantity\"]");
    };

    this._init_();

    this.ShowEditForm = function()
    {
        if (this.mode == this.options.mode_edit)
            return false;

        // show size
        this.controlSizes.find("." + this.options.class_static).hide();
        this.controlSizes.find("." + this.options.class_editable).show();
        // show quantity
        this.controlQuantity.find("." + this.options.class_static).hide();
        this.controlQuantity.find("." + this.options.class_editable).show();
        // show controls
        this.item.find("." + this.options.class_controls + "." + this.options.class_static).hide();
        this.item.find("." + this.options.class_controls + "." + this.options.class_editable).show();
        // disabled controls
        this.item.find("." + this.options.class_saving_loader).hide();
        this.item.find("." + this.options.class_save_button).removeAttr("disabled").show();
        this.item.find("." + this.options.class_cancel_button).removeAttr("disabled").show();

        // set new mode
        this.mode = this.options.mode_edit;
    };

    this.HideEditForm = function()
    {
        if (this.mode != this.options.mode_edit)
            return false;

        // show size
        this.controlSizes.find("." + this.options.class_static).show();
        this.controlSizes.find("." + this.options.class_editable).hide();
        // show quantity
        this.controlQuantity.find("." + this.options.class_static).show();
        this.controlQuantity.find("." + this.options.class_editable).hide();
        // show controls
        this.item.find("." + this.options.class_controls + "." + this.options.class_static).show();
        this.item.find("." + this.options.class_controls + "." + this.options.class_editable).hide();
        // disabled controls
        this.item.find("." + this.options.class_saving_loader).hide();
        this.item.find("." + this.options.class_save_button).removeAttr("disabled").show();
        this.item.find("." + this.options.class_cancel_button).removeAttr("disabled").show();

        // set new mode
        this.mode = this.options.mode_view;
    };

    this.getSavedData = function()
    {
        this.saveData = {
            id: this.id,
            size: this.item.find(this.options.selector_size).val(),
            quantity: this.item.find(this.options.selector_quantity).val(),
            size_title: this.item.find(this.options.selector_size + " :selected").html()
        }
    };

    this.Save = function()
    {
        var self = this;

        if (self.mode != self.options.mode_edit)
            return false;

        // disabled controls
        this.item.find("." + this.options.class_saving_loader).show();
        this.item.find("." + this.options.class_save_button).attr("disabled", "disabled").hide();
        this.item.find("." + this.options.class_cancel_button).attr("disabled", "disabled").hide();

        self.getSavedData();
        var request = getCart($.extend(self.saveData, {
            dataType: "JSON"
        }), self.options.url_update_item);

        request.done(function(res) {
            res = $.parseJSON(res);
            if ("size_title" in self.saveData)
                self.controlSizes.find("."+self.options.class_static).html(self.saveData.size_title);
            if ("quantity" in self.saveData)
                self.controlQuantity.find("."+self.options.class_static).html(self.saveData.quantity);

            updateSmallCart(res.quantity);
            updateCartFooter(res.footer);
            self.HideEditForm();
        });
    };
}

$(function() {
    // replace for javascript:void(0)
    $(document).on("click", ".void", function() {return false;});

    // update cart
    $(document).on("submit", ".discount-code", function() {
        var form = $(this),
            field = form.find('input[name="coupon"]'),
            request;

        if (!field.length)
            return false;

        field.attr("disabled", "disabled");
        form.find('.submit').attr("disabled", "disabled");

        request = getCart({
            coupon: field.val()
        });

        request.done(function(data) {
            $("#cart-popup").html(data);
        });

        return false;
    });

    var
        $filterCollection = $(".filter-scroll .catalog-filter"),
        $filterSrcDestination = $(".catalog-content-filter ul");

    $filterCollection.each(function() {
        $(this).find("ul.selected").each(function() {
            $filterSrcDestination.append($(this).html());
        });
    });
});