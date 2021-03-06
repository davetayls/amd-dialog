/**
 * Dialog
 * ======
 * Loading and controling a global ui dialog
 *
 * @version 0.5.0
 * @license The MIT License (MIT)
 * @preserve Copyright (c) <2011> <Dave Taylor http://the-taylors.org>
 *
 * Readme on http://github.com/davetayls/amd-dialog
 *
 */
/*global define, require */
(function(root, factory){
    if (window.define && window.define.amd) {
        define(['jquery', 'debug', 'jqueryui'], factory);
    } else {
        window.dialog = factory(root.jQuery, root.debug);
    }
}(this, function($, debug){
    'use strict';

    var DEFAULT_OPTIONS = {
            dialogContentId:   'dialog-content',
            linkOpenSelector:  'a.dialog',
            linkCloseSelector: '.dialog-close',
            iframeWidth:       '100%',
            iframeHeight:      400,
            iframeTemplate: '<iframe src="{{url}}" width="{{width}}" height="{{height}}"></iframe>',
            dialogOptions: {
                title: '',
                closeText: 'Close',
                draggable: false,
                modal: true,
                resizable: false,
                width: 640
            }
        }
    ;

    var module,           // this will hold the modules public functions
        isOldIE           = (navigator.appName === "Microsoft Internet Explorer" && (parseFloat(navigator.appVersion.substr(21)) || parseFloat(navigator.appVersion)) < 7),
        isSupported       = !isOldIE,
        $dialog,
        $window           = $(window),
        $body,
        $externalContent,
        $iframeContent,
        $internalPlaceholder = $('<div id="dialog-internalPlaceholder" />'),
        $internalContent,
        $loading          = $('<div class="mod-dialog-loading"><h2>Loading...</h2></div>'),
        settings,
        initialised = false,

        DIALOG_OPEN_CLASS = 'dialog-open'

    ;
    var isSmallScreen = function(){
        return $window.width() < 700;
    };

    /**
     * Load remote content in to a wrapper
     */
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
    var initialiseIframeContent = function(url, options) {
        var iframeHtml = options.iframeTemplate
            .replace('{{url}}', url)
            .replace('{{width}}', options.iframeWidth)
            .replace('{{height}}', options.iframeHeight)
        ;
        if ($iframeContent) {
            $iframeContent.remove();
        }
        $iframeContent  = $('<div id="dialog" class="mod-dialog-iframe"></div>')
            .append(iframeHtml);
    };
    var resetInternalContent = function() {
        if ($internalContent) {
            $internalPlaceholder.after($internalContent)
            .detach();
            $internalContent = null;
        }
    };

    /**
     * listen for jquery ui dialog close event
     */
     var closed = function(e, ui) {
         $body.removeClass(DIALOG_OPEN_CLASS);
     };

    // define the modules public functions
    module = {
        /**
         * Essential first set up of the global dialog settings
         */
        init: function (options) {
            if (!$.fn.dialog) { debug.error('jquery dialog needs to have been loaded'); }
            if (isSupported && !initialised) {
                initialised = true;
                DEFAULT_OPTIONS.$container = $body = $('body');
                settings = $.extend({}, DEFAULT_OPTIONS, options);
                module.attachEvents(settings.$container);
            }
            return this;
        },
        /**
         * Attach any events for the dialog functionality
         */
        attachEvents: function($dialogContainer) {
            var self = this;
            $dialogContainer.delegate(settings.linkOpenSelector, 'click', function (e) {
                var $this = $(this),
                    href = $this.attr('href'),
                    dialogType = $this.data('dialogType');
                self.showDialogType(href, dialogType, {
                    dialogOptions: {
                        $link: $this,
                        title: $this.attr('title')
                    }
                });
                e.preventDefault();
            });
            $body.delegate(settings.linkCloseSelector, 'click', function (e) {
                module.closeDialog();
                e.preventDefault();
            });
        },
        /**
         * Loading
         */
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

        /**
         * Various types of dialog for how to load a url
         */
        dialogTypes: {
            iframe: function(url, options){
                initialiseIframeContent(url, options);
                this.showDialog($iframeContent, options.dialogOptions);
            },
            xhr: function(url){
                module.showUrlInDialog(url);
            },
            internal: function(selector) {
                $internalContent = $(selector).before($internalPlaceholder);
                var $elem = $('<div />');
                $internalContent.appendTo($elem);
                module.showDialog($elem);
            }
        },
        showDialogType: function(url, dialogType, options) {
            this.removeDialog();
            var showOptions = $.extend(true, {}, settings, options);

            // custom dialog type
            if (dialogType) {
                this.dialogTypes[dialogType].call(this, url, showOptions);

            // load external link in iframe
            } else if(/^http/i.test(url) && url.indexOf(location.host) < 0) {
                this.dialogTypes.iframe.call(this, url, showOptions);

            // bring up internal element
            } else if(url.indexOf('#') > -1) {
                this.dialogTypes.internal.call(this, url, showOptions);

            // load url using xhr
            } else {
                this.dialogTypes.xhr.call(this, url, showOptions);
            }
        },
        getShowDialogOptions: function(options) {
            var overrides = {};
            if (isSmallScreen()) {
                overrides.modal = false;
            }
            return $.extend({}, settings.dialogOptions, options, overrides);
        },

        /**
         * Opens the dialog
         */
        showDialog: function($elemToShow, options){
            var opened;
            if ($elemToShow.dialog){
                $dialog = $elemToShow.dialog(this.getShowDialogOptions(options));
                $dialog.bind('dialogclose', closed);
                opened = true;
            }
            if (opened) {
                $body.addClass(DIALOG_OPEN_CLASS);
                module.dialogOpened($elemToShow);
            } else {
                debug.error('ui dialog not loaded');
            }
			return this;
        },
        /**
         * Opens the dialog, shows loading, requests the url
         * via ajax and loads the resutling html in to the dialog
         */
        showUrlInDialog: function (url, options, callback) {
            initialiseExternalContent();
            this.showDialog($externalContent, options);
            this.showLoading();
            loadUrl($externalContent, url, callback);
            return this;
        },

        /**
         * Removes the dialog from the DOM
         */
        removeDialog: function() {
            this.closeDialog();
            if ($dialog) {
                this.emptyDialog();
                $dialog.remove();
                $dialog = null;
            }
			$body.removeClass(DIALOG_OPEN_CLASS);
            return this;
        },
        /**
         * Hides then optionally removes the dialog from the DOM
         * @param remove {boolean} also remove the dialog from the DOM
         */
        closeDialog: function (remove) {
            if ($dialog) {
                $dialog.dialog('close');
                return this;
            }
			$body.removeClass(DIALOG_OPEN_CLASS);
            return this;
        },
        /**
         * Empty the contents of the dialog
         */
        emptyDialog: function () {
            if ($internalContent) {
                resetInternalContent($dialog);
            }
            $dialog.children().remove();
            $dialog.html('');
            return this;
        },
        centerDialog: function() {
            if ($dialog && isSmallScreen()) {
                $dialog.closest('.ui-dialog').css({
                    top: $(window).scrollTop()
                });
            } else if ($dialog) {
                var height = $dialog.outerHeight(),
                    scrollHeight = document.body.scrollTop,
                    wHeight = $(window).height(),
                    top = Math.floor((wHeight/2)-(height/2)) + scrollHeight;
                $dialog.closest('.ui-dialog').css({
                    top: top < 10 ? 10 : top
                });
            }
        },
        /**
         * Provides the ability to customise any form
         * action urls when loading via ajax
         */
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
            return this;
        },
        urlLoaded: function (listener) {
            if (typeof listener === 'function') {
                $(module).bind('dialog.urlLoaded', listener);
                return true;
            } else {
                $(module).trigger('dialog.urlLoaded', arguments);
            }
            return this;
        }
    };

    // expose the public module functions
    return module;

}));

