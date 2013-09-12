$(document).ready(function(){
	//табы личноко кабинета
	$('.container').find('.cardContent').each(function(index,element){
            $(element).hide();
        });
    var id = '#' + $('.filter-scroll').find('.active').attr('data-punkt');
    $('.container').find(id).show();

    $('.lk-menu').on('click', function(){
        $('.container').find('.cardContent').each(function(index,element){
            $(element).hide();
        });
        var id = '#' + $(this).attr('data-punkt');
        $('.container').find(id).show();

    });

	//основное - сообщение с датой рождения
    $('.dateQ').on("click", function(){
        $('.mes').toggle();
        $('.message .dateQ').toggleClass("noOpacity");
    });

    //основное - переключалка мужское-женское
    $('.mainPageContent .gender li').on('click', function(){
		if(!($(this).hasClass('active'))){
			$('.mainPageContent .gender li.active').removeClass('active');
			$(this).addClass('active');
		}
	});

    //страница заказа
    $('.tableLineContent .fifthCol a').on('click', function(){
        if ($(this).hasClass('closed')){
            $(this).parent().find('.opened').removeClass("notActive");
        }
        else{
            $(this).parent().find('.closed').removeClass("notActive");
        }
        $(this).closest('.tableLine').toggleClass('openedLine');
        $(this).addClass("notActive");
        $(this).closest('.tableLineContent').find('.orderDescription').toggle();
    });

    // мои адреса
    $('.addressLine .changeAddressButton').on('click',function(){
        $(this).addClass('pressed');
        $(this).closest('.address').find('.addressDesc').show();
    });
    $('.addressDesc .changeAddressButton').on('click',function(){
        $(this).closest('.address').find('.addressDesc').hide();
        $(this).closest('.address').find('.addressLine .changeAddressButton').removeClass('pressed');
    });

    //таблица из уведомлений

    function TableModel(values)
            {
                this.newsletters = [
                    {
                        name: 'Мужская рассылка'
                    },
                    {
                        name: 'Женская рассылка'
                    },
                    {
                        name: 'Новости блога'
                    }
                ];

                this.frequencies = ['При по-<br/>явлении<br/>новости', '1 раз<br/>в день', '1 раз<br/>в неделю', '1 раз<br/>в месяц'];
                // it is 12 cells with checkboxes
                this.checkboxes = [];

                for (var newsletter in this.newsletters)
                {
                    var isNewsletterActive = false;

                    for (var frequency in this.frequencies)
                    {
                        var isFrequencyActive = !!values.customFirst(function (v) { return v.newsletter == newsletter && v.frequency == frequency; });

                        if (isFrequencyActive) {
                            isNewsletterActive = true;
                        }

                        this.checkboxes.push({
                            newsletter: newsletter,
                            frequency: frequency,
                            val: ko.observable(isFrequencyActive)
                        });
                    }

                    this.newsletters[newsletter].val = ko.observable(isNewsletterActive);
                }

                /*
                newsletter is object
                {
                    name: ...,
                    val: ...
                }
                */

                this.newsletterClick = function (newsletter)
                {
                    newsletter.val(!newsletter.val());
                    var newsletterIndex = this.newsletters.customIndexOf(function (n) { return n.name == newsletter.name; });

                    var newsletterCheckboxes = this.checkboxes
                        .customWhere(function (ch) { return ch.newsletter == newsletterIndex; });

                    if (newsletter.val())
                    {
                        newsletterCheckboxes[0].val(true);
                    }
                    else
                    {
                        newsletterCheckboxes.customForEach(function (ch) {
                            ch.val(false);
                        })
                    }
                }

                /*
                checkbox is object
                {
                    newsletter: it's newsletter index in this.newsletters,
                    frequency: it's frequency index in this.frequencies,
                    val: checked or not, observable
                }
                */

                this.checkboxClick = function (checkbox)
                {
                    checkbox.val(!checkbox.val());
                    var newsletter = this.newsletters[checkbox.newsletter];

                    var newVal = checkbox.val();
                    newsletter.val(newVal);

                    this.checkboxes
                        .customWhere(function (c) { 
                            return c.newsletter == checkbox.newsletter && c.frequency != checkbox.frequency 
                        })
                        .customForEach(function (c) { 
                            c.val(false);
                        });
                } 

                // get checkbox by newsletter object and frequency name
                this.getCheckbox = function (newsletter, frequency)
                {
                    var newsletterIndex = this.newsletters.customIndexOf(function (c) { return c.name == newsletter.name; });
                    var frequencyIndex = this.frequencies.indexOf(frequency);

                    return this.checkboxes
                        .customFirst(function (checkbox) { return newsletterIndex == checkbox.newsletter && frequencyIndex == checkbox.frequency; });
                }
            }

            function CheckedCheckbox(newsletter, frequency)
            {
                this.newsletter = newsletter;
                this.frequency = frequency;
            }
            //инициализация таблицы
            ko.applyBindings(new TableModel([
                new CheckedCheckbox(0, 1),
                new CheckedCheckbox(2, 2)
            ]));
});