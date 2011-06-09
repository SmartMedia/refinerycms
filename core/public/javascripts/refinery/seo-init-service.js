/*global REFINERYCMS, Object, Error, window, $, parent, console */

$(function () {
	var processing = false;
	
	$('#more_options').show();
	
	if (typeof (REFINERYCMS) === 'undefined') {
		throw new Error('REFINERYCMS object is undefined');
	}

	if (typeof (REFINERYCMS.plugin.Seo) === 'undefined') {
		throw new Error('REFINERYCMS.plugin.Seo is undefined');
	}

	var cms = REFINERYCMS,
		seo = new cms.plugin.Seo(),
		elm_keywords = $('#page_meta_keywords'),
		elm_browser_title = $('#page_browser_title'),
		elm_description = $('#page_meta_description');

	if (elm_keywords.length > 0 && elm_browser_title.length > 0 && elm_description.length) {
		var keywords_rules = {
			'filled': true,
			'min_length': 3,
			'min_word_length' : 3,
			'max_length': 80,
			'min_words_count': 2,
			'max_words_count': 7
		};

		var title_rules = {
			'filled': true,
			'min_length': 10,
			'max_length': 100
		};

		var description_rules = {
			'filled': true,
			'min_length': 20,
			'max_length': 100
		};

		var onchange = function () {
			seo.render({
				'holder' : $('#seo-validator-holder'),
				'validation_data': seo.validate()
			});
		};

		seo.set_element(elm_keywords, 'meta_tag_keywords', keywords_rules);
		seo.set_element(elm_browser_title, 'browser_title', title_rules);
		seo.set_element(elm_description, 'meta_tag_description', description_rules);

		seo.set_stop_on_first_error(true);

		elm_keywords.bind('change', onchange);
		elm_description.bind('change', onchange);
		elm_browser_title.bind('change', onchange);

		elm_keywords.bind('keyup', onchange);
		elm_description.bind('keyup', onchange);
		elm_browser_title.bind('keyup', onchange);

		onchange();

		$('#run-seo-validator').bind('click', function (e) {
			e.preventDefault();

			if (!processing) {
				processing = true;

				seo.render({
					'holder' : $('#seo-validator-holder'),
					'validation_data': seo.validate(),
					'fade': true
				});

				processing = false;
			}

			return false;
		});

		$('#run-seo-highlighter').bind('click', function (e) {
			var kw = v = '',
				kcfg = {
					'fade' : true,
					'draggable' : true,
					'resizable' : true
				};

			e.preventDefault();

			if (!processing) {
				processing = true;
				seo.spinner_on($('#seo-report div.header'));

				v = seo.validate();

				// wymeditor smells
				try {
					$.each(WYMeditor.INSTANCES, function(index, wym) {
					  wym.update();
					});
				} catch (err) {
					// alert(err);
				}

				if (v['meta_tag_keywords']['filled']) {
					kw = elm_keywords.val().split(', ');
					seo.set_keywords(kw);
					seo.highlight(kcfg);
				} else {
					alert(I18n.t('refinerycms.plugin.seo.validators.empty_meta_keywords'));
					elm_keywords.focus();
				}
				
				seo.spinner_off($('#seo-report div.header'));
				processing = false;
			}

			return false;
		});


		$('#run-seo-analyzer').bind('click', function (e) {
			var kw = '',
				kcfg = {
					'fade' : true,
					'draggable' : true,
					'resizable' : true
				},
				l = document.location.pathname,
				v = seo.validate();

			e.preventDefault();

			if (!processing) {
				processing = true;
				seo.spinner_on($('#seo-report div.header'));
				
//				l = 'http://localhost:3000/';
				l = l.replace(/^\/refinery\/pages\/|\/edit$/gi, '');
				l = (l != 'home') ? '/' + l : '/';
				
				if (v['meta_tag_keywords']['filled']) {
					$.ajax({
						url: l,
						dataType : 'html',
						error: function (r) {
							alert(I18n.t('refinerycms.plugin.seo.validators.page_not_found'));
						},
						success: function (r) {
							kcfg.document = r;
							kw = elm_keywords.val().split(', ');
							seo.set_keywords(kw);

							seo.analyse(kcfg);

							seo.spinner_off($('#seo-report div.header'));
							processing = false;
						}
					});
				} else {
					alert(I18n.t('refinerycms.plugin.seo.validators.empty_meta_keywords'));
					elm_keywords.focus();
					seo.spinner_off($('#seo-report div.header'));
					processing = false;
				}					
			}

			return false;
		});
	}

});
