// WYM dialogs
var image_dialog = {
  initialised: false
  , callback: null

  , init: function(callback){
    
    if (!this.initialised) {
      this.callback = callback;
      this.init_tabs();
      this.init_select();
      this.init_actions();
      this.initialised = true;
    }
    return this;
  }

  , init_tabs: function(){
    var radios = $('#dialog_menu_left input:radio');
    var selected = radios.parent().filter(".selected_radio").find('input:radio').first() || radios.first();

    radios.click(function(){
      link_dialog.switch_area($(this));
    });

    selected.attr('checked', 'true');
    link_dialog.switch_area(selected);
  }

  , switch_area: function(radio){
    $('#dialog_menu_left .selected_radio').removeClass('selected_radio');
    $(radio).parent().addClass('selected_radio');
    $('#dialog_main .dialog_area').hide();
    $('#' + radio.value + '_area').show();
  }

  , init_select: function(){
    $('#existing_image_area_content ul li img').click(function(){
        image_dialog.set_image(this);
    });
    //Select any currently selected, just uploaded...
    if ((selected_img = $('#existing_image_area_content ul li.selected img')).length > 0) {
      image_dialog.set_image(selected_img.first());
    }
  }

  , set_image: function(img){
    if ($(img).length > 0) {
      $('#existing_image_area_content ul li.selected').removeClass('selected');

      $(img).parent().addClass('selected');
      var imageId = $(img).attr('data-id');
      var geometry = $('#existing_image_size_area li.selected a').attr('data-geometry');
      var size = $('#existing_image_size_area li.selected a').attr('data-size');
      var resize = $("#wants_to_resize_image").is(':checked');

      image_url = resize ? $(img).attr('data-' + size) : $(img).attr('data-original');

      if (parent) {
        if ((wym_src = parent.document.getElementById('wym_src')) != null) {
          wym_src.value = image_url;
        }
        if ((wym_title = parent.document.getElementById('wym_title')) != null) {
          wym_title.value = $(img).attr('title');
        }
        if ((wym_alt = parent.document.getElementById('wym_alt')) != null) {
          wym_alt.value = $(img).attr('alt');
        }
        if ((wym_size = parent.document.getElementById('wym_size')) != null
            && typeof(geometry) != 'undefined') {
          wym_size.value = geometry.replace(/[<>=]/g, '');
        }
      }
    }
  }

  , submit_image_choice: function(e) {
    e.preventDefault();
    if($.isFunction(this.callback))
    {
      this.callback(img_selected);
    }
    close_dialog(e);

  }

  , init_actions: function(){
    var _this = this;
    // get submit buttons not inside a wymeditor iframe
    $('#existing_image_area .form-actions-dialog #submit_button')
      .click($.proxy(_this.submit_image_choice, _this));

    // get cancel buttons not inside a wymeditor iframe
    $('.form-actions-dialog #cancel_button')
      .not('.wym_iframe_body .form-actions-dialog #cancel_button')
      .click($.proxy(close_dialog, _this));

    $('#existing_image_size_area ul li a').click(function(e) {
      $('#existing_image_size_area ul li').removeClass('selected');
      $(this).parent().addClass('selected');
      $('#existing_image_size_area #wants_to_resize_image').attr('checked', 'checked');
      image_dialog.set_image($('#existing_image_area_content ul li.selected img'));
      e.preventDefault();
    });

    $('#existing_image_size_area #wants_to_resize_image').change(function(){
      if($(this).is(":checked")) {
        $('#existing_image_size_area ul li:first a').click();
      } else {
        $('#existing_image_size_area ul li').removeClass('selected');
        image_dialog.set_image($('#existing_image_area_content ul li.selected img'));
      }
    });

    image_area = $('#existing_image_area').not('#wym_iframe_body #existing_image_area');
    image_area.find('.form-actions input#submit_button').click($.proxy(function(e) {
      e.preventDefault();
      $(this.document.getElementById('wym_dialog_submit')).click();
    }, parent));
    image_area.find('.form-actions a.close_dialog').click(close_dialog);
  }
};

var link_dialog = {
  initialised: false
  , init: function(){
    
    if (!this.initialised) {
      this.init_tabs();
      this.init_resources_submit();
      this.init_close();
      this.page_tab();
      this.web_tab();
      this.email_tab();
      this.initialised = true;
    }
  },

  init_tabs: function(){
    var radios = $('#dialog_menu_left input:radio');
    var selected = radios.parent().filter(".selected_radio").find('input:radio').first() || radios.first();

    radios.click(function(){
      link_dialog.switch_area($(this));
    });

    selected.attr('checked', 'true');
    link_dialog.switch_area(selected);
  },

  init_resources_submit: function(){
    $('#existing_resource_area .form-actions-dialog #submit_button').click(function(e){
      e.preventDefault();
      if((resource_selected = $('#existing_resource_area_content ul li.linked a')).length > 0) {
        resourceUrl = parseURL(resource_selected.attr('href'));
        relevant_href = resourceUrl.pathname;

        // Add any alternate resource stores that need a absolute URL in the regex below
        if(resourceUrl.hostname.match(/s3.amazonaws.com/)) {
          relevant_href = resourceUrl.protocol + '//' + resourceUrl.host + relevant_href;
        }

        if (typeof(resource_picker.callback) == "function") {
          resource_picker.callback({
            id: resource_selected.attr('id').replace("resource_", "")
            , href: relevant_href
            , html: resource_selected.html()
          });
        }
      }
    });

    $('.form-actions-dialog #cancel_button').trigger('click');
  },

  init_close: function(){
    $('.form-actions-dialog #cancel_button').not('.wym_iframe_body .form-actions-dialog #cancel_button').click(close_dialog);

    if (parent
        && parent.document.location.href != document.location.href
        && parent.document.getElementById('wym_dialog_submit') != null) {
      $('#dialog_container .form-actions input#submit_button').click(function(e) {
        e.preventDefault();
        $(parent.document.getElementById('wym_dialog_submit')).click();
      });
      $('#dialog_container .form-actions a.close_dialog').click(close_dialog);
    }
  },

  switch_area: function(area){
    $('#dialog_menu_left .selected_radio').removeClass('selected_radio');
    $(area).parent().addClass('selected_radio');
    $('#dialog_main .dialog_area').hide();
    $('#' + $(area).val() + '_area').show();
  },

  //Same for resources tab
  page_tab: function(){
    $('.link_list li').click(function(e){
      e.preventDefault();

      $('.link_list li.linked').removeClass('linked');
      $(this).addClass('linked');

      var link = $(this).children('a.page_link').get(0);
      var port = (window.location.port.length > 0 ? (":" + window.location.port) : "");
      var url = link.href.replace(window.location.protocol + "//" + window.location.hostname + port, "");

      link_dialog.update_parent(url, link.rel.replace(/\ ?<em>.+?<\/em>/, ''));
    });
  },

  web_tab: function(){
    link_tester.validate_url_textbox("#web_address_text",  function() {
      link_dialog.update_parent( $('#web_address_text').val(),
                                 $('#web_address_text').val(),
                                 ($('#web_address_target_blank').get(0).checked ? "_blank" : "")
                               );
    });

    $('#web_address_target_blank').click(function(){
      parent.document.getElementById('wym_target').value = this.checked ? "_blank" : "";
    });
  },

  email_tab: function() {
    $('#email_address_text, #email_default_subject_text, #email_default_body_text').change(function(e){
      var default_subject = $('#email_default_subject_text').val(),
          default_body = $('#email_default_body_text').val(),
          mailto = "mailto:" + $('#email_address_text').val(),
          modifier = "?",
          icon = '';

      $('#email_address_test_loader').show();
      $('#email_address_test_result').hide();
      $('#email_address_test_result').removeClass('success_icon').removeClass('failure_icon');


      link_tester.email(mailto, function (success) {
        if (success) {
          icon = 'success_icon';
        }else{
          icon = 'failure_icon';
        }
        $('#email_address_test_result').addClass(icon).show();
        $('#email_address_test_loader').hide();
      });

      if(default_subject.length > 0){
        mailto += modifier + "subject=" + default_subject;
        modifier = "&";
      }

      if(default_body.length > 0){
        mailto += modifier + "body=" + default_body;
        modifier = "&";
      }

      link_dialog.update_parent(mailto, mailto.replace('mailto:', ''));
    });
  },

  update_parent: function(url, title, target) {
    if (parent != null) {
      if ((wym_href = parent.document.getElementById('wym_href')) != null) {
        wym_href.value = url;
      }
      if ((wym_title = parent.document.getElementById('wym_title')) != null) {
        wym_title.value = title;
      }
      if ((wym_target = parent.document.getElementById('wym_target')) != null) {
        wym_target.value = target || "";
      }
    }
  }
};

onOpenDialog = function(dialog) {
  (dialog = $('.ui-dialog')).find('.ui-dialog-titlebar').corner('1px top');
  if(!$.browser.msie){
    dialog.corner('6px');
  }
  if (dialog.height() < $(window).height()) {
    if(iframed()) {
      $(parent.document.body).addClass('hide-overflow');
    } else {
      $(document.body).addClass('hide-overflow');
    }
  }
};

onCloseDialog = function(dialog) {
  if(iframed()) {
    $(parent.document.body).removeClass('hide-overflow');
  } else {
    $(document.body).removeClass('hide-overflow');
  }
};

WYMeditor.onload_functions = [];
var wymeditor_inputs = [];
var wymeditors_loaded = 0;
// supply custom_wymeditor_boot_options if you want to override anything here.
if (typeof(custom_wymeditor_boot_options) == "undefined") { custom_wymeditor_boot_options = {}; }
var form_actions =
"<div id='dialog-form-actions' class='form-actions'>"
  + "<div class='form-actions-left'>"
    + "<input id='submit_button' class='wym_submit button' type='submit' value='{Insert}' class='button' />"
    + "<a href='' class='wym_cancel close_dialog button'>{Cancel}</a>"
  + "</div>"
+ "</div>";
var wymeditor_boot_options = $.extend({
  skin: 'refinery'
  , basePath: "/"
  , wymPath: "/javascripts/wymeditor/jquery.refinery.wymeditor.js"
  , cssSkinPath: "/stylesheets/wymeditor/skins/"
  , jsSkinPath: "/javascripts/wymeditor/skins/"
  , langPath: "/javascripts/wymeditor/lang/"
  , iframeBasePath: '/'
  , classesItems: [
    {name: 'text-align', rules:[{name: 'left', title: '{Left}'}, {name: 'center', title: '{Center}'}, {name: 'right', title: '{Right}'}, {name: 'justify', title: '{Justify}'}], join: '-', title: '{Text_Align}'}
    , {name: 'image-align', rules:[{name: 'left', title: '{Left}'}, {name: 'right', title: '{Right}'}], join: '-', title: '{Image_Align}'}
    , {name: 'font-size', rules:[{name: 'small', title: '{Small}'}, {name: 'normal', title: '{Normal}'}, {name: 'large', title: '{Large}'}], join: '-', title: '{Font_Size}'}
  ]

  , containersItems: [
    {'name': 'h1', 'title':'Heading_1', 'css':'wym_containers_h1'}
    , {'name': 'h2', 'title':'Heading_2', 'css':'wym_containers_h2'}
    , {'name': 'h3', 'title':'Heading_3', 'css':'wym_containers_h3'}
    , {'name': 'p', 'title':'Paragraph', 'css':'wym_containers_p'}
  ]
  , toolsItems: [
    {'name': 'Bold', 'title': 'Bold', 'css': 'wym_tools_strong'}
    ,{'name': 'Italic', 'title': 'Emphasis', 'css': 'wym_tools_emphasis'}
    ,{'name': 'InsertUnorderedList', 'title': 'Unordered_List', 'css': 'wym_tools_unordered_list'}
    ,{'name': 'InsertOrderedList', 'title': 'Ordered_List', 'css': 'wym_tools_ordered_list'}
    /*,{'name': 'Indent', 'title': 'Indent', 'css': 'wym_tools_indent'}
    ,{'name': 'Outdent', 'title': 'Outdent', 'css': 'wym_tools_outdent'}
    ,{'name': 'Undo', 'title': 'Undo', 'css': 'wym_tools_undo'}
    ,{'name': 'Redo', 'title': 'Redo', 'css': 'wym_tools_redo'}*/
    ,{'name': 'CreateLink', 'title': 'Link', 'css': 'wym_tools_link'}
    ,{'name': 'Unlink', 'title': 'Unlink', 'css': 'wym_tools_unlink'}
    ,{'name': 'InsertImage', 'title': 'Image', 'css': 'wym_tools_image'}
    ,{'name': 'InsertTable', 'title': 'Table', 'css': 'wym_tools_table'}
    //,{'name': 'Paste', 'title': 'Paste_From_Word', 'css': 'wym_tools_paste'}
    ,{'name': 'ToggleHtml', 'title': 'HTML', 'css': 'wym_tools_html'}
  ]

  ,toolsHtml: "<ul class='wym_tools wym_section wym_buttons'>"
                + WYMeditor.TOOLS_ITEMS
              + "</ul>"

  ,toolsItemHtml:
    "<li class='" + WYMeditor.TOOL_CLASS + "'>"
      + "<a href='#' name='" + WYMeditor.TOOL_NAME + "' title='" + WYMeditor.TOOL_TITLE + "' class='no-tooltip'>"
        + WYMeditor.TOOL_TITLE
      + "</a>"
    + "</li>"

  , classesHtml: "<ul class='wym_classes_container wym_section wym_buttons'>"
                   + "<li class='wym_tools_class'>"
                   + "<a href='#' name='" + WYMeditor.APPLY_CLASS + "' title='"+ WYMeditor.APPLY_CLASS +"' class='no-tooltip'>"
                     + WYMeditor.APPLY_CLASS
                   + "</a>"
                   + "<ul class='wym_classes wym_classes_hidden'>" + WYMeditor.CLASSES_ITEMS + "</ul>"
                  + "</li>"
                + "</ul>"

  , classesItemHtml: "<li><a href='#' name='"+ WYMeditor.CLASS_NAME + "'>"+ WYMeditor.CLASS_TITLE+ "</a></li>"
  , classesItemHtmlMultiple: "<li class='wym_tools_class_multiple_rules'>"
                              + "<span>" + WYMeditor.CLASS_TITLE + "</span>"
                              + "<ul>{classesItemHtml}</ul>"
                            +"</li>"

  , containersHtml: "<ul class='wym_containers wym_section'>" + WYMeditor.CONTAINERS_ITEMS + "</ul>"

  , containersItemHtml:
      "<li class='" + WYMeditor.CONTAINER_CLASS + "'>"
        + "<a href='#' name='" + WYMeditor.CONTAINER_NAME + "' title='" + WYMeditor.CONTAINER_TITLE + "' class='no-tooltip'></a>"
      + "</li>"

  , boxHtml:
  "<div class='wym_box'>"
    + "<div class='wym_area_top clearfix'>"
      + WYMeditor.CONTAINERS
      + WYMeditor.TOOLS
      + WYMeditor.CLASSES
    + "</div>"
    + "<div class='wym_area_main'>"
      + WYMeditor.HTML
      + WYMeditor.IFRAME
      + WYMeditor.STATUS
    + "</div>"
  + "</div>"

  , iframeHtml:
    "<div class='wym_iframe wym_section'>"
     + "<iframe id='WYMeditor_" + WYMeditor.INDEX + "'" + ($.browser.msie ? " src='" + WYMeditor.IFRAME_BASE_PATH + "wymiframe'" : "")
     + " frameborder='0' marginheight='0' marginwidth='0' border='0'"
     + " onload='this.contentWindow.parent.WYMeditor.INSTANCES[" + WYMeditor.INDEX + "].loadIframe(this);'></iframe>"
    +"</div>"

  , dialogImageHtml: ""

  , dialogLinkHtml: ""

  , dialogTableHtml:
    "<div class='wym_dialog wym_dialog_table'>"
      + "<form>"
        + "<input type='hidden' id='wym_dialog_type' class='wym_dialog_type' value='"+ WYMeditor.DIALOG_TABLE + "' />"
        + "<div class='field'>"
          + "<label for='wym_caption'>{Caption}</label>"
          + "<input type='text' id='wym_caption' class='wym_caption' value='' size='40' />"
        + "</div>"
        + "<div class='field'>"
          + "<label for='wym_rows'>{Number_Of_Rows}</label>"
          + "<input type='text' id='wym_rows' class='wym_rows' value='3' size='3' />"
        + "</div>"
        + "<div class='field'>"
          + "<label for='wym_cols'>{Number_Of_Cols}</label>"
          + "<input type='text' id='wym_cols' class='wym_cols' value='2' size='3' />"
        + "</div>"
        + form_actions
      + "</form>"
    + "</div>"

  , dialogPasteHtml:
    "<div class='wym_dialog wym_dialog_paste'>"
      + "<form>"
        + "<input type='hidden' id='wym_dialog_type' class='wym_dialog_type' value='" + WYMeditor.DIALOG_PASTE + "' />"
        + "<div class='field'>"
          + "<textarea class='wym_text' rows='10' cols='50'></textarea>"
        + "</div>"
        + form_actions
      + "</form>"
    + "</div>"

  , dialogPath: "/refinery/dialogs/"
  , dialogFeatures: {
      width: 866
    , height: 455
    , modal: true
    , draggable: true
    , resizable: false
    , autoOpen: true
    , open: onOpenDialog
    , close: onCloseDialog
  }
  , dialogInlineFeatures: {
      width: 600
    , height: 485
    , modal: true
    , draggable: true
    , resizable: false
    , autoOpen: true
    , open: onOpenDialog
    , close: onCloseDialog
  }

  , dialogId: 'editor_dialog'

  , dialogHtml:
    "<!DOCTYPE html>"
    + "<html dir='" + WYMeditor.DIRECTION + "'>"
      + "<head>"
        + "<link rel='stylesheet' type='text/css' media='screen' href='" + WYMeditor.CSS_PATH + "' />"
        + "<title>" + WYMeditor.DIALOG_TITLE + "</title>"
        + "<script type='text/javascript' src='" + WYMeditor.JQUERY_PATH + "'></script>"
        + "<script type='text/javascript' src='" + WYMeditor.WYM_PATH + "'></script>"
      + "</head>"
      + "<body>"
        + "<div id='page'>" + WYMeditor.DIALOG_BODY + "</div>"
      + "</body>"
    + "</html>"
  , postInit: function(wym)
  {
    // register loaded
    wymeditors_loaded += 1;

    // fire loaded if all editors loaded
    if(WYMeditor.INSTANCES.length == wymeditors_loaded){
      $('.wym_loading_overlay').remove();

      // load any functions that have been registered to happen onload.
      // these will have to be registered BEFORE postInit is fired (which is fairly quickly).
      for(i=0; i < WYMeditor.onload_functions.length; i++) {
        WYMeditor.onload_functions[i]();
      }
    }

    $(wym._iframe).contents().find('body').addClass('wym_iframe_body');

    $('.field.hide-overflow').removeClass('hide-overflow').css('height', 'auto');
  }
  , postInitDialog: function(wym) {
    if($.browser.msie) {
      ($the_ui_dialog = $('.ui-dialog')).css('height',
        $the_ui_dialog.find('iframe').height()
        + $the_ui_dialog.find('iframe').contents().find('.form-actions').height()
        - 12
      );
    }
  }
  , lang: (typeof(I18n.locale) != "undefined" ? I18n.locale : 'en')
}, custom_wymeditor_boot_options);

WYMeditor.editor.prototype.loadIframe = function(iframe) {
  var wym = this;

  // Internet explorer doesn't like this (which versions??)
  var doc = (iframe.contentDocument || iframe.contentWindow);
  if(doc.document) {
    doc = doc.document;
  }
  if (!$.browser.msie) {
    doc.open('text/html', 'replace');
    html = "<!DOCTYPE html>\
    <html>\
      <head>\
        <title>WYMeditor</title>\
        <meta charset='" + $('meta[charset]').attr('charset') + "' />\
        <meta http-equiv='X-UA-Compatible' content='IE=edge,chrome=1' />\
      </head>\
      <body class='wym_iframe'>\
      </body>\
    </html>";
    doc.write(html);
    doc.close();

    var doc_head = doc.head || $(doc).find('head').get(0);
    $.each(["wymeditor/skins/refinery/wymiframe", "formatting", "refinery/theme", "theme"], function(i, href) {
      $("<link href='/stylesheets/" + href + ".css?"+Math.random().toString().split('.')[1]+"' media='all' rel='stylesheet' />").appendTo(doc_head);
    });
  }
  if ((id_of_editor = wym._element.parent().attr('id')) != null) {
    $(doc.body).addClass(id_of_editor);
  }

  wym.initIframe(iframe);
};

WYMeditor.init = function() {
  wymeditor_inputs = $('.wymeditor');
  wymeditor_inputs = wymeditor_inputs.filter(function(index) {
    for (i=0; i < WYMeditor.INSTANCES.length; i++) {
      if (WYMeditor.INSTANCES[i]._element.attr('id') == $(this).attr('id')) {
        return false;
      }
    }

    return true;
  });

  wymeditor_inputs.each(function(input) {
    if ((containing_field = $(this).parents('.field')).length > 0 && containing_field.get(0).style.height === '') {
      containing_field.addClass('hide-overflow')
                      .css('height', $(this).outerHeight() - containing_field.offset().top + $(this).offset().top + 45);
    }
    $(this).hide();
  });

  wymeditor_inputs.wymeditor(wymeditor_boot_options);
};

$(function(){
  WYMeditor.init();
});

var resource_picker = {
  initialised: false
  , callback: null

  , init: function(callback) {
    
    if (!this.initialised) {
      this.callback = callback;
      this.initialised = true;
    }
  }
};

