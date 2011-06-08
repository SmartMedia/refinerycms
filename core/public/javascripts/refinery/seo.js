/**
* The REFINERYCMS form object for client side validating forms in REFINERYCMS.
* Based on REFINERYCMS.formForms https://github.com/REFINERYCMS.form/REFINERYCMS.form/raw/master/client-side/forms/REFINERYCMS.formForms.js
*
*
* @version    $Id$
* @package    refinerycms-js
* @copyright  Copyright (C) 2011
* @author     keraM marek@keram.name http//keram.name
* @class      form
* @license    MIT
*/

/*global REFINERYCMS, Object, Error, window, $, parent, console, I18n */

'use strict';

REFINERYCMS.namespace('REFINERYCMS.plugin.Seo');

REFINERYCMS.plugin.Seo = function (config) {
	this.init(config);
};

REFINERYCMS.plugin.Seo.validators = { };
REFINERYCMS.plugin.Seo.analyzers = { };
REFINERYCMS.plugin.Seo.decorator = { };

var cms = REFINERYCMS;

REFINERYCMS.namespace('I18n.translations.cs.refinerycms.plugin.seo');

I18n.translations.cs.refinerycms.plugin.seo = {
	'seo_report' : 'SEO report',
	'run_validator' : 'Validace',
	'run_highlighter' : 'Zvýraznění',
	'run_analyzer' : 'Analýza',
	'close_popup' : 'Zavřít',
	'highlighted_keywords_on_page' : 'Zvýrazněné klíčové slova na stránce',
	'part' : {
		'title' : 'Název',
		'page_body' : 'Tělo'
	},
	'analyse_table' : {
		'title' : 'Statistická tabulka'
	},
	'validators' : {
		'empty_meta_keywords' : 'Nejsou definováná žádná klíčová slova',
		'page_not_found' : 'Stránka nebyla zatím uložena',
		'filled' : 'políčko musí být vyplněné',
		'min_words_count' : 'minimální počet slov {{arg}}',
		'min_word_length' : 'minimální délka slova je {{arg}} znaků',
		'min_length' : 'minimální délka {{arg}} znaků',
		'max_length' : 'maximální délka {{arg}} znaků',
		'function_not_exists' : 'Validační funkce {{fnc}} nenalezena.',
		'state_rule_false' : '{{rule}}',
		'state_ok' : 'Všechno v pořádku',
		'state_error' : 'Prosím zkontroluj správné vyplnění atributů',
		'meta_tag_keywords' : 'meta tag klíčové slova',
		'meta_tag_description' : 'meta tag description',
		'browser_title' : 'Titulek prohlížeče'
	}
};

/**
 * Class for handling everything between page and snippets
 */
REFINERYCMS.plugin.Seo.prototype = {
	title: 'seo_report',
	instance: null,
	keywords: [],
	text: '',
	text_words: [],
	text_sentences: [],
	elements: {},
	
	processing: false,

	stop_on_first_error: true,

	validation_rules: {
		meta_tag_keywords: {
			'filled': true,
			'min_length': 10,
//			'min_word_length': 3,
			'max_length': 100,
			'min_words_count': 1,
			'max_words_count': 5
		}
	},
	
	spinner_on: function (holder) {
		holder.addClass('spinner');
	},
	
	spinner_off: function (holder) {
		holder.removeClass('spinner');
	},

	sanitize_word: function (word) {
		var str = word || '',
			t = '',
			i = str.length,
			unsafe_chars = 'áäčďéěíĺľňóô öŕšťúů üýřžÁÄČĎÉĚÍĹĽŇÓÔ ÖŔŠŤÚŮ ÜÝŘŽ',
			safe_chars = 'aacdeeillnoo orstuu uyrzAACDEEILLNOO ORSTUU UYRZ';

		while (i--) {
			if (unsafe_chars.indexOf(str.charAt(i)) !== -1) {
				t += safe_chars.charAt(safe_chars.indexOf(str.charAt(i)));
				continue;
			}

			t += str.charAt(i);
		}

		str = str.replace(/[.,_$\\\/!?{}\(\(]/, '');

		return str;
	},

	sanitize_text: function (text) {
		var txt = $.trim(text);
		txt = txt.replace(/ /g, '%space%');
		txt = txt.replace(/\s/g, '');
		txt = txt.replace(/%space%/g, ' ');

		return txt;
	},

	count_text_words: function () {
		return this.get_text_words().length;
	},

	count_keywords: function () {
		return this.keywords.length;
	},

	set_keywords: function (k) {
		this.keywords = k;
	},

	set_text: function (t) {
		this.text = this.sanitize_text(t);
	},

	set_stop_on_first_error: function (stop) {
		this.stop_on_first_error = stop;
	},

	set_text_words: function () {
		var words = this.text.split(' '),
			i = words.length,
			word = '',
			tmp_words = [];

		while (i--) {
			word = this.sanitize_word(words[i]);
			if (word) {
				tmp_words[tmp_words.length] = word;
			}
		}

		this.text_words = tmp_words.reverse();
	},

	set_text_sentences: function () {
		var text = this.text,
			res = [],
			split_by = function (str, splitter) {
				str.split(splitter);
			};

		this.text_sentences = '';
	},

	get_keywords: function () {
		return this.keywords;
	},

	get_text: function () {
		return this.text;
	},

	get_text_words: function () {
		return this.text_words;
	},

	get_text_sentences: function () {
		return this.text_sentences;
	},

	get_highlighted_keywords: function (text, keywords) {
		var t = text || this.get_text(),
			k = keywords || this.get_keywords(),
			rg = null,
			r = '',
			top_k = (k.length > 0) ? k[0] : null;
		
		k.sort(function (a, b) {
			if (a.length < b.length) {
				return -1;
			}
			if (a.length > b.length) {
				return 1;
			}

			return 0;
		});

		for (var i = k.length; i--;) {
			rg = new RegExp('(' + k[i] + ')', 'ig');
			if (k[i] === top_k) {
				t = t.replace(rg, '%%HIGHLIGHTTOP%%$1%%\/HIGHLIGHTTOP%%');
			} else {
				t = t.replace(rg, '%%HIGHLIGHT%%$1%%\/HIGHLIGHT%%');
			}
		}

		t = t.replace(/%%HIGHLIGHT%%/g, '<span class="keyword-highlighted">');
		t = t.replace(/%%\/HIGHLIGHT%%/g, '</span>');

		t = t.replace(/%%HIGHLIGHTTOP%%/g, '<span class="keyword-highlighted top">');
		t = t.replace(/%%\/HIGHLIGHTTOP%%/g, '</span>');

		r = t;

		return r;
	},

	get_element: function (elm_key) {
		if (!this.elements[elm_key]) {
			this.elements[elm_key] = $('#' + elm_key);
		}

		return this.elements[elm_key];
	},

	set_element: function (elm, key, rules) {
		this.elements[key] = elm;

		if (typeof (rules) !== 'undefined') {
			this.validation_rules[key] = rules;
		}
	},

	validate: function () {
		var that = this,
			validator = REFINERYCMS.plugin.Seo.validators,
			result = [],
			elm = null,
			elm_key = null,
			rule = null;

		for (elm_key in that.validation_rules) {
			elm = that.get_element(elm_key);
			if (elm.length > 0) {
				result[elm_key] = [];
				for (rule in that.validation_rules[elm_key]) {
					result[elm_key][rule] = validator.testElm(elm, rule, that.validation_rules[elm_key][rule]);

					if (!result[elm_key][rule] && that.stop_on_first_error) {
						break;
					}
				}
			}
		}

		return result;
	},

	analyse: function (data) {
		var that = this,
			analyzer = REFINERYCMS.plugin.Seo.analyzers,
			ad = REFINERYCMS.plugin.Seo.analyzeDecorator,
			acfg = {};

		acfg.document = data.document || '';
		
		acfg.pkw = this.get_keywords();
		acfg.fade = true;	
		analyzer.init(acfg);
		
		acfg.data = analyzer.getReport();
		
		ad.render(acfg);
	},

	highlight: function (cfg) {
		var hcfg = cfg || {},
			texts = [],
			title_text,
			page_body,
			page_sidebar,
			browser_title_text,
			meta_desc_text = null,
			hd = REFINERYCMS.plugin.Seo.higlightDecorator;

		// required
		title_text = {'label' : I18n.t('refinerycms.plugin.seo.part.title', {defaultValue : 'Title'}), 'body' : this.get_highlighted_keywords($('#page_title').val())};
		page_body = {'label' : I18n.t('refinerycms.plugin.seo.part.page_body', {defaultValue : 'Page body'}), 'body' : this.get_highlighted_keywords($('#page_parts_attributes_0_body').val())};

		texts = [title_text, page_body];

		// optional
		if ($('#page_parts_attributes_1_body').length > 0  &&  $('#page_parts_attributes_1_body').val() !== '') {
			page_sidebar = {'label' : 'Page sidebar', 'body' : this.get_highlighted_keywords($('#page_parts_attributes_1_body').val())};
			texts.push(page_sidebar);
		}

		if ($('#page_browser_title').length > 0 && $('#page_browser_title').val() !== '') {
			browser_title_text = {'label' : 'Browser title', 'body' : this.get_highlighted_keywords($('#page_browser_title').val())};
			texts.push(browser_title_text);
		}

		if ($('#page_meta_description').length > 0 && $('#page_meta_description').val() !== '') {
			meta_desc_text = {'label' : 'Meta description', 'body' : this.get_highlighted_keywords($('#page_meta_description').val())};
			texts.push(meta_desc_text);
		}

		hcfg.texts = texts;
		hcfg.holder = $('#page_container');

		return hd.render(hcfg);
	},

	render: function (config) {
		var decorator = REFINERYCMS.plugin.Seo.decorator;

		// put content to decorator
		decorator.render(config, this);
	},

	/**
	 * Initialization
	 * @param config Object
	 */
	init: function (config) {
		config = config || {};

		this.set_keywords(config.keywords || []);
		this.set_text(config.text || '');
		this.set_text_words();
		this.set_stop_on_first_error(config.stop_on_first_error || this.stop_on_first_error);
	}
};

REFINERYCMS.plugin.Seo.validators = {

	testElm: function (element, rule, args) {
		var result = false,
			elm = $(element),
			fnc = this[REFINERYCMS.String.camelize(rule)];

		if (typeof (fnc) === 'undefined') {
			throw new Error(I18n.t('refinerycms.plugin.seo.validators.function_not_exists', {
				defaultValue: "Function for Validation rule {{fnc}} not exists.",
				fnc: REFINERYCMS.String.camelize(rule)
			}));
		}

		if (typeof (fnc) === 'function') {
			result = fnc(args, elm.val());
		}

		return result;
	},

	maxWordsCount: function (arg, val) {
		return val.split(',').length <= arg;
	},

	minWordsCount: function (arg, val) {
		return !!val && val.split(',').length >= arg;
	},

	filled: function (arg, val) {
		return val !== '' && val !== false && val !== null;
	},

	minLength: function (arg, val) {
		return val.length >= arg;
	},

	minWordLength: function (arg, val, separator) {
		var s = separator || ', ',
			arr = val.split(s);

		if (arr.length > 0) {
			for (var i = arr.length; i--;) {
				if (arr[i].length <= arg) {
					return false;
				}
			}
		}

		return true;
	},

	maxLength: function (arg, val) {
		return val.length <= arg;
	},

	length: function (arg, val) {
		arg = REFINERYCMS.plugin.Seo.validators.isArray(arg) ? arg: [arg, arg];
		return (arg[0] === null || val.length >= arg[0]) && (arg[1] === null || val.length <= arg[1]);
	},

	isArray: function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	}
};





REFINERYCMS.namespace('REFINERYCMS.plugin.Seo.analyzers');

REFINERYCMS.plugin.Seo.analyzers = {
	config : {},
	
	pkw : [], // on page keywords
	
	wkw : [], // website keywords

	document : null,
	
	data : {},
	
	report : {},

	sanitize_html_elm_data: function (data) {
		var result = [], t = '';
		
		if (data) {
			for (var i = 0; i < data.length; i++) {
				t = data[i];
				result[i] = t.replace(/(<([^>]+)>)/ig, '');
			}
		}
		
		return result;
	},
	
	count_keywords: function () {
		var elm, j, k, l, d, t, rg1, rg2 = '',
			pkw = this.pkw,
			report = this.report;
		d = this.data;
		
		for (var elm_key in d) {
			j = d[elm_key].length;
			report[elm_key] = report[elm_key] || {};
			report[elm_key]['pkw'] = report[elm_key]['pkw'] || [];
		
			while (j--) {
				t = d[elm_key][j];
				k = 0;
				
				while (k < pkw.length) {
					rg1 = t.match(new RegExp('(' + this.pkw[k] + ')', 'ig'));
					report[elm_key]['pkw'][k] = report[elm_key]['pkw'][k] || 0;
					report[elm_key]['pkw'][k] = rg1 ? report[elm_key]['pkw'][k] + rg1.length : report[elm_key]['pkw'][k];						
					k++;
				}
			}
		}
		
		
		this.report = report;
	},
	
	process: function () {
		var that = this;

		if (that.document) {
			var d = that.document;
			var tmp1 = that.document.match(/<h1>(.*)<\/h1>/ig);
			var tmp2 = that.document.match(/<h2>(.*)<\/h2>/ig);
			var tmp3 = that.document.match(/<p>(.*)<\/p>/ig);
			var tmp4 = that.document.match(/<a(.*)<\/a>/ig);
			var tmp5 = that.document.match(/<body>(.*)<\/body>/ig);
			var tmp6 = that.document.match(/<title(.*)<\/title>/ig);
			
			that.data['h1'] = that.sanitize_html_elm_data(tmp1);
			that.data['h2'] = that.sanitize_html_elm_data(tmp2);
			that.data['p'] = that.sanitize_html_elm_data(tmp3);
			that.data['a'] = that.sanitize_html_elm_data(tmp4);
			that.data['body'] = that.sanitize_html_elm_data(tmp5);
			that.data['title'] = that.sanitize_html_elm_data(tmp6);
			
			that.count_keywords();
		}
	},

	getReport: function () {
		return this.report;
	},
	
	sanitize_response : function (response) {
		var result = '';
		
		result = response.replace(/<script.*[^<]<\/script>/g, '');
		result = result.replace(/<!--.*[^-]-->/g, '');
		
		return result;
	},

	init: function (cfg) {
		this.config = cfg || {};
		this.pkw = cfg.pkw || [];
		this.wkw = cfg.wkw || [];
		this.document = cfg.document || '';
		this.process();
		this.count_keywords();
	}
};



REFINERYCMS.plugin.Seo.decorator = {
	validation_data: [],
	analysis_data: [],
	holder: '',
	report: '',
	rendered: false,
	report_id: 'seo-report',

	getHeader: function () {
		var header = $('#' + this.report_id).find('.header');
		if (header.length > 0) {
			return header;
		}

		header = $('<div />', {
			'class': 'header'
		});

//		header.append(
//			$('<h2 />', {'text': I18n.t('refinerycms.plugin.seo.seo_report', {defaultValue : 'Seo report'})})
//		);

		header.append(
			$('<a />', {
				'id': 'run-seo-validator',
				'text': I18n.t('refinerycms.plugin.seo.run_validator', {defaultValue : 'Validate'}),
				'class': 'button'
			})
		);

		header.append(
			$('<a />', {
				'id': 'run-seo-highlighter',
				'text': I18n.t('refinerycms.plugin.seo.run_highlighter', {defaultValue : 'Highlight keywords'}),
				'class': 'button'
			})
		);

		header.append(
			$('<a />', {
				'id': 'run-seo-analyzer',
				'text': I18n.t('refinerycms.plugin.seo.run_analyzer', {defaultValue : 'Analýza'}),
				'class': 'button'
			})
		);

		return header;
	},

	getWrapper: function () {
		var wrapper = $('#' + this.report_id);
		if (wrapper.length > 0) {
			return wrapper;
		}

		return $('<div />', {
			'id': this.report_id
		});
	},

	getContent: function () {
		var content = $('#' + this.report_id).find('.content');
		if (content.length > 0) {
			content.html(this.buildContent());
			return content;
		}

		return $('<div />', {
			'class': 'content',
			'html': this.buildContent()
		});
	},

	getFooter: function () {
		var footer = $('#' + this.report_id).find('.footer');
		if (footer.length > 0) {
			return footer;
		}


		return $('<div />', {
			'class': 'footer',
			'html': '&nbsp;'
		});
	},

	buildAnalysisContent: function () {
		var that = this,
			ul = '',
			error_found = false,
			analysis_holder = $('<div />', {'class': 'analysis-content'});

		return analysis_holder;
	},

	buildValidationContent: function () {
		var that = this,
			elm = null,
			elm_par = null,
			error_found = false,
			elm_key = null,
			msg = '',
			elm_seo_error_holder = null,
			rule = null,
			validation_holder = $('<div />', {'class': 'validation-content'});

		for (elm_key in this.validation_data) {
			error_found = false;

			for (rule in this.validation_data[elm_key]) {
				elm = that._seo.elements[elm_key];
				if (!elm) {
					continue;
				}
				
				elm_par = elm.parent();
				elm_seo_error_holder = elm_par.find('.seo-validation');
				
				if (elm_seo_error_holder.length > 0) {
					elm_seo_error_holder.hide();
				}
				
				if (!this.validation_data[elm_key][rule]) {
					error_found = true;

					if (elm_seo_error_holder.length === 0) {
						elm_seo_error_holder = $('<div />', {
							'class' : 'seo-validation error ' + rule
						});

						elm_par.append(elm_seo_error_holder);
					}

					msg = I18n.t('refinerycms.plugin.seo.validators.state_rule_false', {
						defaultValue: "{{rule}} in  {{elm}} is false.",
						rule: I18n.t('refinerycms.plugin.seo.validators.' + rule, {defaultValue : rule, arg : that._seo.validation_rules[elm_key][rule]}),
						elm:  I18n.t('refinerycms.plugin.seo.validators.' + elm_key, {defaultValue : elm_key})
					});

					msg = msg[0].toUpperCase() + msg.substr(1);

					elm_seo_error_holder.html(msg);
					elm_seo_error_holder.show();
				} 
			}
		}
		
		if (error_found) {
			validation_holder.append($('<div />', {
				'class' : 'error',
				'text' : I18n.t('refinerycms.plugin.seo.validators.state_error', 'error')
			}));
		}

		return validation_holder;
	},

	buildContent: function () {
		var tmp_holder = $('<div />');

		tmp_holder.append(this.buildValidationContent());
		tmp_holder.append(this.buildAnalysisContent());

		return tmp_holder;
	},

	destroy: function () {
		this.report.find('a').unbind('click');
		this.report.remove();
		this.report = '';
	},

	render: function (cfg, seo) {
		cfg = cfg || {};
		this._seo = seo || {};
		
		var that = this;

		this.validation_data = cfg.validation_data || [];

		this.holder = cfg.holder || $('#more_options');
		
		if (this.holder.length > 0) {
			this.report = this.getWrapper();
			// when is rendered only rewrite content data

			if (!this.rendered) {
				this.report.append(this.getHeader());
				this.report.append(this.getContent());
//				this.report.append(this.getFooter());

				this.holder.prepend(this.report);
				this.rendered = true;
			} else {
				if (cfg.fade && typeof (this.report.fadeIn) === 'function') {
					this.report.fadeOut('normal', function () {
						that.getContent();
						that.report.fadeIn();
					});
				} else {
					this.getContent();
				}
			}
		}
	}
};

REFINERYCMS.plugin.Seo.higlightDecorator = {
	texts: [],
	holder: '',
	report: '',
	rendered: false,
	report_id: 'seo-keywords-highlight-popup',

	getHeader: function () {
		var that = this,
			header = $('#' + this.report_id).find('.header');
		if (header.length > 0) {
			return header;
		}

		header = $('<div />', {
			'class': 'header'
		});

		header.append(
			$('<h2 />', {'text': I18n.t('refinerycms.plugin.seo.highlighted_keywords_on_page', {defaultValue : 'Highlighted keywords on page'})})
		);

		var close_button = $('<a />', {
			'text' : I18n.t('refinerycms.plugin.seo.close_popup', {defaultValue : 'Close'}),
			'class' : 'button close_dialog',
			'href' : '#'
		});

		close_button.bind('click', function (e) {
			e.preventDefault();
			that.report.hide();
			return false;
		});

		header.append(
			close_button
		);

		return header;
	},

	getWrapper: function () {
		var wrapper = $('#' + this.report_id);
		if (wrapper.length > 0) {
			return wrapper;
		}

		return $('<div />', {
			'class' : 'seo-popup',
			'id' : this.report_id
		});
	},

	getContent: function () {
		var content = $('#' + this.report_id).find('.content');
		if (content.length > 0) {
			content.html(this.buildContent());
			return content;
		}

		return $('<div />', {
			'class': 'content',
			'html': this.buildContent()
		});
	},

	getFooter: function () {
		return $('<div />', {
			'class': 'footer',
			'html': '&nbsp;'
		});
	},

	buildHighlightContent: function () {
		var that = this,
			block,
			higlight_holder = $('<div />', {'class': 'higlight-content'});

		$.each(this.texts, function () {
			block = $('<div />', {
				'class' : 'element-holder',
				'html' : $('<h3 />', {'html': this.label, 'class' : 'element-title'})
			});

			block.append($('<div />', {'html' : this.body, 'class' : 'element-content'}));

			higlight_holder.append(block);
		});

		return higlight_holder;
	},

	buildContent: function () {
		var tmp_holder = $('<div />');

		tmp_holder.append(this.buildHighlightContent());

		return tmp_holder;
	},

	destroy: function () {
		this.report.find('a').unbind('click');
		this.report.remove();
		this.report = '';
	},

	render: function (cfg) {
		cfg = cfg || {};
		cfg.draggable = cfg.draggable || false;
		cfg.resizable = cfg.draggable || false;
		cfg.fade = cfg.fade || false;
		
		var that = this;

		this.texts = cfg.texts || [];

		this.holder = $('body');

		if (this.holder.length > 0) {
			this.report = this.getWrapper();
			// when is rendered only rewrite content data

			if (!this.rendered) {
				this.report.append(this.getHeader());
				this.report.append(this.getContent());
				this.holder.prepend(this.report);
				
				this.report.hide();
				if (cfg.fade && typeof (this.report.fadeIn) === 'function') {
					this.report.fadeIn();
				} else {
					this.report.show();
				}
				
				if (cfg.draggable && typeof (this.report.draggable) === 'function') {
					this.report.draggable({
						'handle': '.header h2',
						'containment' : '#content-wrapper'
					});
				}
				
				if (cfg.resizable && typeof (this.report.resizable) === 'function') {
					this.report.resizable();
				}
				
				this.rendered = true;
			} else {
				this.report.hide();				
				this.getContent();		
				
				if (cfg.fade && typeof (this.report.fadeIn) === 'function') {
					this.report.fadeIn();
				} else {
					this.report.show();
				}
			}
		}
	}
};

REFINERYCMS.plugin.Seo.analyzeDecorator = {
	cfg: {},
	holder: '',
	report: '',
	rendered: false,
	report_id: 'seo-analyze-report',

	getHeader: function () {
		var that = this,
			header = $('#' + this.report_id).find('.header');
		if (header.length > 0) {
			return header;
		}

		header = $('<div />', {
			'class': 'header'
		});

		header.append(
			$('<h2 />', {'text': I18n.t('refinerycms.plugin.seo.analyse_table.title', {defaultValue : 'Analyse table'})})
		);

		var close_button = $('<a />', {
			'text' : I18n.t('refinerycms.plugin.seo.close_popup', {defaultValue : 'Close'}),
			'class' : 'button close_dialog',
			'href' : '#'
		});

		close_button.bind('click', function (e) {
			e.preventDefault();
			that.report.hide();
			return false;
		});

		header.append(
			close_button
		);

		return header;
	},

	getWrapper: function () {
		var wrapper = $('#' + this.report_id);
		if (wrapper.length > 0) {
			return wrapper;
		}

		return $('<div />', {
			'class' : 'seo-popup',
			'id' : this.report_id
		});
	},

	buildAnalyseTable: function () {
		var t = '',
			th = '',
			tb = '',
			h1cls = '',
			h2cls = '',
			acls = '',
			acnt = 0,
			cfg = this.cfg;
		
		t = $('<table />');
		th = $('<thead />');
		
		th.html('<tr><td class="c1">&nbsp;</td><th class="c1">H1</th><th class="c1">H2</th><th class="c1">Odkazy</th></tr>');
		t.append(th);
		
		tb = $('<tbody />');
				
		if (cfg.pkw) {
		
			for (var i = 0; i < cfg.pkw.length; i++ ) {
				h1cls = (cfg.data['h1'] && cfg.data['h1']['pkw'] && cfg.data['h1']['pkw'][i] && cfg.data['h1']['pkw'][i] > 0) ? 'ok' : 'unsufficient';
				h2cls = (cfg.data['h2'] && cfg.data['h2']['pkw'] && cfg.data['h2']['pkw'][i] && cfg.data['h2']['pkw'][i] > 0) ? 'ok' : 'unsufficient';
				acls = (cfg.data['a'] && cfg.data['a']['pkw'] && cfg.data['a']['pkw'][i] && cfg.data['a']['pkw'][i] > 0) ? 'ok' : 'unsufficient';
				acnt = (acls === 'ok') ? cfg.data['a']['pkw'][i] : 0;
				tb.html(
					tb.html() + 
					'<tr><th>' + cfg.pkw[i] + '</th>' +
					'<td class="' + h1cls + '">&nbsp;</td>' +
					'<td class="' + h2cls + '">&nbsp;</td>' +
					'<td class="' + acls + '">' + acnt + '</td></tr>'
				);
			}
		}
		
		t.append(tb);	
	
		return t;
	},
	
	getContent: function () {
		var content = $('#' + this.report_id).find('.content');
		if (content.length > 0) {
			content.html(this.buildContent());
			return content;
		}

		return $('<div />', {
			'class': 'content',
			'html': this.buildAnalyseTable()
		});
	},

	getFooter: function () {
		return $('<div />', {
			'class': 'footer',
			'html': '&nbsp;'
		});
	},

	buildContent: function () {
		var tmp_holder = $('<div />');

		tmp_holder.append(this.buildAnalyseTable());

		return tmp_holder;
	},

	destroy: function () {
		this.report.find('a').unbind('click');
		this.report.remove();
		this.report = '';
	},

	render: function (cfg) {
		var that = this;
		
		cfg = cfg || {};
		cfg.draggable = cfg.draggable || true;
		cfg.resizable = cfg.draggable || false;
		cfg.fade = cfg.fade || false;
				
		this.cfg = cfg;
		this.holder = $('body');

		if (this.holder.length > 0) {
			this.report = this.getWrapper();
			
			if (!this.rendered) {
				this.report.append(this.getHeader());
				this.report.append(this.getContent());
				this.holder.prepend(this.report);
				
				this.report.hide();
				if (cfg.fade && typeof (this.report.fadeIn) === 'function') {
					this.report.fadeIn();
				} else {
					this.report.show();
				}
				
				if (cfg.draggable && typeof (this.report.draggable) === 'function') {
					this.report.draggable({
						'handle': '.header h2',
						'containment' : '#content-wrapper'
					});
				}
				
				if (cfg.resizable && typeof (this.report.resizable) === 'function') {
					this.report.resizable();
				}
				
				this.rendered = true;
			} else {
				this.getContent();
				
				this.report.hide();
				if (cfg.fade && typeof (this.report.fadeIn) === 'function') {
					this.report.fadeIn();
				} else {
					this.report.show();
				}
			}
		}
	}
};
