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
        *   # Constructor
        *   ----
        *   function(client, user, session, lang, API_VERSION)
        *   - *string **client** aka. veridu_id* **(required)**
        *   - *string **user** username*
        *   - *string **lang** language, defaults to 'en-us'*
        *   - *string **API_VERSION** API version, defaults to '0.3'*
        *
        *   The user must configure the provider within the configuration phase of the angular app.
        *   *other parameters are injected automatically*
        *
        */
        var Veridu = function(client, lang, API_VERSION, user, session, $httpParamSerializerJQLike, $http, $log, $window, $rootScope){
            var vm = this;
            vm.user = {};
            vm.Util = new Util();
            // API Module
            vm.API = {
                fetch: apiFetch
            };
            // SSO Module
            vm.SSO = {
                login: login,
                logout: logout
            };

            // #### Storage helper
            var Storage = {
                setItem: setStorageItem,
                removeItem: removeStorageItem,
                getItem: getStorageItem
            };

            init();

            if (! valid(arguments))
                return this;

            function init() {
                vm.cfg = {
                    user: user,
                    client: client,
                    session: session,
                    lang: lang || 'en-us',
                    get API_VERSION() { return API_VERSION || '0.3'; },
                    get URL() {
                        return {
                            api: 'https://api.veridu.com/',
                            widget: 'https://widget.veridu.com',
                            assets: 'https://assets.veridu.com/'
                        };
                    }
                };

                // populate if the session is already stored
                ssoPopulate(Storage.getItem('veriduSSOData'));

                // listens for SSO Logins
                $window.addEventListener('message', function (evt) {
                    if (evt.origin == vm.cfg.URL.widget) {
                        ssoPopulate(evt.data);
                    }
                });
            }

            /**
            *   # API Module functions
            *   ###### function API.fetch(method, resource, parameters)
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
            }

            /**
            *   # SSO Module functions
            *   ###### function SSO.login(provider)
            *   ----
            *   Logins with given provider, emits 'veriduSSOLogin' event when ssoPopulate is called
            *   - *string **provider** provider's name*
            */
            function login(provider) {
                if (vm.cfg.session) {
                    $log.error('User already signed! Logout if you want to access via another SSO provider');
                    return false;
                }

                window.open(vm.cfg.URL.widget + '/' + vm.cfg.API_VERSION +'/sso/login/'+ provider +'/'+ vm.cfg.client +'?language=' + vm.cfg.lang + '&mobile=true&session=&nonce=nonce&redirect=' + $window.location.toString(), '_blank',"width=500,height=500");
            }

            /**
            *   ###### function SSO.logout()
            *   ----
            *   Logs out and emits logout event
            */
            function logout() {
                Storage.removeItem('veriduSSOData');
                $rootScope.$emit('veriduSSOLogout', {cfg: vm.cfg, user: vm.user});

                delete vm.cfg.session;
                delete vm.cfg.user;
                delete vm.SSO.provider;
                delete vm.user.name;
                delete vm.user.email;

                if (! $rootScope.$$phase)
                    $rootScope.$apply();

            }

            /**
            *   ###### function ssoPopulate(data)
            *   ----
            *   Populates the Provider, emits 'veriduSSOLogin' event
            *
            */
            function ssoPopulate(data) {
                if (! data)
                    return false;
                try {
                    data = typeof data == 'string' ? JSON.parse(data) : data;
                    vm.cfg.session = data.veridu_session;
                    vm.cfg.user = data.veridu_id;
                    vm.SSO.provider = data.veridu_provider;
                    vm.user.name = data.veridu_name;
                    vm.user.email = data.veridu_email;
                    Storage.setItem('veriduSSOData', data);

                    // apllies only if an apply is not ongoing
                    if (! $rootScope.$$phase)
                        $rootScope.$apply();

                    // emits event
                    $rootScope.$emit('veriduSSOLogin', data);

                } catch (e) {
                    $log.error('Error parsing API response');
                    return false;
                }
            }

            /**
            *   # Util
            *   ----
            *   Url helper functions
            */
            function Util () {
                this.buildUrl = buildUrl;
                this.apiUrl = apiUrl;
                this.widgetUrl = widgetUrl;
                this.assetsUrl = assetsUrl;

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
                    return buildUrl(vm.cfg.URL.widget + '/' + vm.cfg.API_VERSION + '/' + resource + '/', params);
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
            *   Currently only 'client' is mandatory
            */
            function valid(args) {
                if (typeof(args[0]) === 'undefined') {
                    $log.error("Please specify Veridu 'client' on the  confguration phase of your application.");
                    return false;
                }
                return true;
            }

            // ## Storage helper functions
            // localStorage wrappers

            function setStorageItem(key, value) {
                return $window.localStorage.setItem(key, JSON.stringify(value));
            }

            function removeStorageItem(key) {
                return $window.localStorage.removeItem(key);
            }

            function getStorageItem(key) {
                try{
                    return JSON.parse($window.localStorage.getItem(key));
                } catch(e) {
                    $window.localStorage.removeItem(key);
                    return undefined;
                }
            }

        };

        Veridu.$get = ['$http', '$log', '$httpParamSerializerJQLike', '$window', '$rootScope', function VeriduFactory($http, $log, $httpParamSerializerJQLike, $window, $rootScope) {
            return new Veridu(this.client, this.lang, this.API_VERSION, this.user, this.session, $httpParamSerializerJQLike, $http, $log, $window, $rootScope);
        }];

        return Veridu;
    });

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = 'veridu-angularjs-sdk';
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return 'veridu-angularjs-sdk';
        });
    }
}());
