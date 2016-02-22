(function() {
    'use strict';

    // ###### Creating module
    var module = angular.module('veridu.angularjs.sdk', []);
    // ###### Creating provider
    module.provider('Veridu', function VeriduProvider() {
        var client,
            user,
            session;

        /**
        *   ###### Constructor function(client, user, session, lang, API_VERSION)
        *   ----
        *   - *string **client** client id *
        *   - *string **user** username*
        *   - *string **lang** language, defaults to 'en-us'*
        *   - *string **API_VERSION** API version, defaults to '0.3'*
        *
        *   The user must configure the provider within the configuration phase of the angular app.
        *   *other parameters are injected automatically*
        *
        */
        var service = function(client, user, session, lang, API_VERSION, $httpParamSerializerJQLike, $http, $log){
            var vm = this;
            vm.user = {};
            vm.Util = new Util();
            vm.API = {
                fetch: apiFetch
            };

            if (! valid(arguments))
                return this;

            vm.cfg = {
                user: user,
                client: client,
                session: session,
                lang: lang || 'en-us',
                get API_VERSION() { return API_VERSION  || '0.3'; },
                get URL() {
                    return {
                        api: 'https://api.veridu.com/',
                        widget: 'https://widget.veridu.com/',
                        assets: 'https://assets.veridu.com/'
                    }
                }
            };

            /**
            *   ###### function apiFetch(method, resource, parameters)
            *   ----
            *   Fetches the API
            *   - *string **method**  'GET', 'PUT', 'POST', 'DELETE'*
            *   - *string **resource**   part of URI*
            *   - *mixed **parameters** request params*
            */
            function apiFetch(method, resource, parameters) {

                var availableMethods = ['GET', 'PUT', 'POST', 'DELETE'];

                if (! resource) {
                    $log.error('Calling API.fetch with invalid resource parameter! (' + resource + ')');
                    return false;
                }

                if (availableMethods.indexOf(method.toUpperCase()) == -1) {
                    $log.error('Calling API.fetch with invalid method parameter! (' + method + ')');
                    return false;
                }

                return $http({
                    method: method,
                    url: vm.Util.apiUrl(resource),
                    headers: {
                        'Veridu-Client': vm.cfg.client,
                        'Veridu-Session': vm.cfg.session
                    },
                    params: parameters || {},
                    paramSerializer: '$httpParamSerializerJQLike'
                });


            };

            /**
            *   ###### function Util
            *   ----
            *   Helper functions
            */
            function Util () {
                this.buildUrl = buildUrl;
                this.apiUrl = apiUrl;
                this.widgetUrl = widgetUrl;
                this.assetsUrl = assetsUrl;
                this.getProviderUrl = getProviderUrl;

                /**
                *   ###### Url Helpers(resource, params)
                *   ----
                *   Creates a route to the chosen endpoint API, assets or widget.
                *   - *string **resource** part of the URI*
                *   - *mixed|string **params** parementers*
                */

                function apiUrl(resource, params) {
                    return buildUrl(vm.cfg.URL.api + vm.cfg.API_VERSION + '/' + resource + '/', params);
                }
                function assetsUrl(resource, params) {
                    return buildUrl(vm.cfg.URL.assets + vm.cfg.API_VERSION + '/' + resource, params);
                }
                function widgetUrl(resource, params) {
                    return buildUrl(vm.cfg.URL.widget + vm.cfg.API_VERSION + '/' + resource + '/', params);
                }

                function buildUrl(url, params) {
                    if (params) {
                        if (url.indexOf('?') > -1)
                            url += '&';
                        else
                            url += '?';
                        if (typeof params == 'string')
                            return url + params;
                        return url + $httpParamSerializerJQLike(params);
                    }
                    return url;
                }

            }

            /**
            *   ###### function valid(args)
            *   ----
            *   Check if the injected Provider has the required arguments
            *   - *arguments **args** All the arguments that the provider has been called with*
            */
            function valid(args) {
                var v = true;

                v = validate(args[0], 'client') && v;
                v = validate(args[1], 'user') && v;
                v = validate(args[2], 'session') && v;
                v = validate(args[3], 'lang') && v;
                v = validate(args[4], 'API_VERSION') && v;

                return v;
            }

            /**
            *   ###### function validate(prop, propName)
            *   ----
            *   Check if the given property is valid for its criteria
            *   - *string **propName** property name*
            *   - *string **prop** property value*
            */
            function validate(prop, propName) {
                switch (propName) {
                    case 'user':
                    case 'client':
                    case 'session':
                        if (typeof(prop) === 'undefined') {
                            var msg = "Please specify Veridu '" + propName + "' on the  confguration phase of your application.";
                            $log.error(msg);
                            return false;
                        }
                        break;
                }

                return true;
            }

            /**
            *   ###### function getProviderUrl(provider)
            *   ----
            *   Helper function to get common provider urls like twitter, facebook, paypal, linkedin...
            *   - *string **provider** provider's name
            */
            function getProviderUrl(provider) {
                return vm.cfg.URL.widget + vm.cfg.API_VERSION +'/provider/login/'+ provider +'/'+ vm.cfg.client +'/'+ vm.cfg.user +'?session='+ vm.cfg.session +'&amp;language=' + vm.cfg.lang;
            };

        }

        service.$get = ['$http', '$log', '$httpParamSerializerJQLike', function VeriduFactory($http, $log, $httpParamSerializerJQLike) {
            return new service(this.client, this.user, this.session, this.lang, this.API_VERSION, $httpParamSerializerJQLike, $http, $log);
        }];

        return service;
    });

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = 'angular-veridu-sdk';
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return 'angular-veridu-sdk';
        });
    }
}());
