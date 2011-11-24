/**
 * Dialog
 * ======
 * Loading and controling the global dialog
 *
 * @version 0.3
 * @license The MIT License (MIT)
 * @preserve Copyright (c) <2011> <Dave Taylor http://the-taylors.org>
 *
 */
/*jslint browser: true, vars: true, white: true, forin: true */
/*global define, require */
define(
[
    'jquery/core',
    'lib/debug'
],
function($, debug){
    'use strict';


    var module,           // this will hold the modules public functions
        isOldIE           = (navigator.appName === "Microsoft Internet Explorer" && (parseFloat(navigator.appVersion.substr(21)) || parseFloat(navigator.appVersion)) < 7),
        isSmallScreen     = window.screen ? window.screen.width < 700 : false,
        $dialog,
        isSupported       = !isOldIE && !isSmallScreen,
        $body,
        $container,
        $externalContent,
        $iframeContent,
        $loading          = $('<div class="mod-dialog-loading"><h2>Loading...</h2></div>'),
        settings,
        initialised = false,

        DIALOG_OPEN_CLASS = 'dialog-open',

        DEFAULT_OPTIONS = {
            dialogContentId:   'dialog-content',
            linkOpenSelector:  'a.dialog',
            linkCloseSelector: '.dialog-close',
            iframeWidth:       '100%',
            iframeHeight:      400
        },
        DIALOG_DEFAULTS = {
            title: '',
            closeText: 'Close',
            draggable: false,
            modal: true,
            resizable: false,
            width: 640
        }
    ;

    var loadUrl = function ($wrapper, url, callback) {
        $wrapper.load(url + ' #' + settings.dialogContentId, function (data, status) {
            if (status === 'success') {
                $wrapper.find('form').each(function () {
                    var actionUrl = $(this).attr('action');
                    $(this).attr('action', module.getActionUrl(actionUrl));
                });
                module.hideLoading();
                module.urlLoaded(url);
                if (typeof callback === 'function') { callback.call(this, url); }
            } else {
                debug.error('problem loading dialog', module, status);
            }
        });
    };
    var initialiseExternalContent = function() {
        if ($externalContent) {
            $externalContent.remove();
        }
        $externalContent  = $('<div id="dialog" class="mod-dialog-ext" />');
    };
    var initialiseIframeContent = function(url, width, height) {
        if ($iframeContent) {
            $iframeContent.remove();
        }
        $iframeContent  = $('<div id="dialog" class="mod-dialog-iframe"><iframe src="' + url + '" width="' + width + '" height="' + height + '"></iframe></div>');
    };

    // define the modules public functions
    module = {
        init: function ($dialogContainer, options) {
            if (isSupported && !initialised) {
                initialised = true;
                settings = $.extend({}, DEFAULT_OPTIONS, options);
                $body = $('body');
                $container = $dialogContainer || $body;
                module.attachEvents($container);
            }
            return this;
        },
        dialogTypes: {
            iframe: function($link, url, options){
                initialiseIframeContent(url, 
                    options.iframeWidth, 
                    options.iframeHeight);
                this.showDialog($iframeContent, options.dialogOptions);
            },
            xhr: function($link, url){
                module.showUrlInDialog(url);
            }
        },
        attachEvents: function($dialogContainer) {
            var self = this;
            $dialogContainer.delegate(settings.linkOpenSelector, 'click', function (e) {
                var $this = $(this),
                    href = $this.attr('href'),
                    dialogType = $this.data('dialogType');
                self.showDialogType($this, href, dialogType);
                e.preventDefault();
            });
            $body.delegate(settings.linkCloseSelector, 'click', function (e) {
                module.closeDialog();
                e.preventDefault();
            });
        },
        showLoading: function () {
            if ($loading) {
                $loading.hide()
                    .appendTo($dialog.closest('.ui-dialog'));
                $loading.fadeIn(500);
            }
            return this;
        },
        hideLoading: function () {
            if ($loading) {
                $loading.fadeOut(500);
            }
            return this;
        },   
        showDialogType: function($link, url, dialogType) {
            var showOptions = $.extend(true, {}, settings, {
                dialogOptions: {
                    title: $link.attr('title')
                }
            });
            this.removeDialog();
            if (dialogType) {
                this.dialogTypes[dialogType].call(this, $link, url, showOptions);
            } else {
                this.dialogTypes.xhr.call(this, $link, url, showOptions);
            }
        },
        showDialog: function($elemToShow, options){
            this.removeDialog();
			if ($elemToShow.dialog){
			    $body.addClass(DIALOG_OPEN_CLASS);
				$dialog = $elemToShow.dialog($.extend({}, DIALOG_DEFAULTS, options));
                module.dialogOpened($elemToShow);
			} else {
                debug.error('ui dialog not loaded');
            }
			return this;
        },
        emptyDialog: function () {
            $dialog.children().remove();
            $dialog.html('');
            return this;
        },
        removeDialog: function() {
            if ($dialog) {
                $dialog.remove();
                $dialog = null;
            }
			$body.removeClass(DIALOG_OPEN_CLASS);
            return this;
        },
        showUrlInDialog: function (url, callback) {
            this.removeDialog();
            initialiseExternalContent();
            this.showDialog($externalContent);
            this.showLoading();
            loadUrl($externalContent, url, callback);
            return this;
        },
        closeDialog: function () {
            if ($dialog) {
                $dialog.dialog('close');
                this.removeDialog();
                return this;
            }
			$body.removeClass(DIALOG_OPEN_CLASS);
            return this;
        },
        centerDialog: function() {
            if ($dialog) {
                var height = $dialog.outerHeight(),
                    scrollHeight = document.body.scrollTop,
                    wHeight = $(window).height();
                $dialog.closest('.ui-dialog').css({ 
                    top: Math.floor((wHeight/2)-(height/2)) + scrollHeight
                });
            }
        },
        getActionUrl: function (url) {
            return url;
        },
        /*
        * EVENTS
        */
        dialogOpened: function(listener) {
            if (typeof listener === 'function') {
                $(module).bind('dialog.dialogOpened', listener);
                return true;
            } else {
                $(module).trigger('dialog.dialogOpened', arguments);
            }
        },
        urlLoaded: function (listener) {
            if (typeof listener === 'function') {
                $(module).bind('dialog.urlLoaded', listener);
                return true;
            } else {
                $(module).trigger('dialog.urlLoaded', arguments);
            }
        }
    };

    // expose the public module functions
    return module;
});


