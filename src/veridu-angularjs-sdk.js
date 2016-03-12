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
            var Storage = new StorageInterface();

            this.nonce = Storage.getItem('nonce') || Math.round(Math.random() * 100000000);
            vm.user = {};
            vm.initialize = initialize;
            vm.logout = logout;
            vm.Util = new Util();
            vm.API = new API();
            vm.SSO = new SSO();
            vm.Widget = new Widget();

            // cfg
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
            initialize();

            /**
            *   ###### function logout
            *   ----
            *   Logs out competely and emits 'VeriduLogout' event
            */
            function logout() {
                $rootScope.$emit('VeriduLogout', ((vm.profile && vm.profile.user) || vm.user));
                vm.user = {};

                delete vm.profile;
                delete vm.cfg.session;
                delete vm.cfg.user;
                Storage.removeItem('cfg');
                vm.SSO.logout();

                initialize();
            }
            // # API Module
            function API() {
                this.fetch = fetch;

                /**
                *   # API Module functions
                *   ###### function API.fetch(method, resource, parameters)
                *   ----
                *   Fetches the API
                *   - *string **method**  'GET', 'PUT', 'POST', 'DELETE'*
                *   - *string **resource**   part of URI*
                *   - *mixed **parameters** request params*
                */
                function fetch(method, resource, parameters) {

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
            }

            // # SSO Module
            function SSO() {
                this.login = login;
                this.logout = logout;
                this.populate = ssoPopulate;

                // listens for SSO Logins
                $window.addEventListener('message', function (evt) {
                    if (evt.origin == vm.cfg.URL.widget) {
                        ssoPopulate(evt.data);
                    }
                });

                /**
                *   ###### function SSO.logout()
                *   ----
                *   Logs out and emits 'VeriduSSOLogout' event
                */
                function logout() {
                    Storage.removeItem('sso');
                    $rootScope.$emit('VeriduSSOLogout', {cfg: vm.cfg, user: vm.user});
                    delete vm.SSO.provider;

                    if (! $rootScope.$$phase)
                        $rootScope.$apply();
                }

                /**
                *   ###### function ssoPopulate(data)
                *   ----
                *   Populates the Provider, emits 'VeriduSSOLogin' event
                *
                */
                function ssoPopulate(data) {
                    if (! data)
                        return false;

                    try {
                        data = typeof data == 'string' ? JSON.parse(data) : data;
                        vm.SSO.provider = data.veridu_provider;
                        vm.user.name = data.veridu_name;
                        vm.user.email = data.veridu_email;
                        Storage.setItem('sso', data);
                        // apllies only if an apply is not ongoing
                        if (! $rootScope.$$phase)
                            $rootScope.$apply();
                        // emits event
                        $rootScope.$emit('VeriduSSOLogin', data);

                    } catch (e) {
                        $log.error('Error parsing API response');
                        return false;
                    }
                }

                /**
                *   # SSO Module functions
                *   ###### function SSO.login(provider)
                *   ----
                *   Logins with given provider, emits 'VeriduSSOLogin' event when ssoPopulate is called
                *   - *string **provider** provider's name*
                */
                function login(provider) {
                    if (vm.cfg.session) {
                        $log.error('User already signed! Logout if you want to access via another SSO provider');
                        // return false;
                    }
                    window.open(vm.cfg.URL.widget + '/' + vm.cfg.API_VERSION +'/sso/login/'+ provider +'/'+ vm.cfg.client +'?language=' + vm.cfg.lang + '&mobile=true&session='+ vm.cfg.session +'&nonce=nonce&redirect=' + $window.location.toString(), 'sso', 'width=500,height=500');
                }

            }

            // # Widget Module
            function Widget() {
                this.login = login;

                function login(provider) {
                    window.open('https://widget.veridu.com/'+ vm.cfg.API_VERSION + '/provider/login/'+ provider +'/'+ vm.cfg.client +'/'+ vm.cfg.user +'?session='+ vm.cfg.session +'&amp;language=en-us', '_system');
                }
            }

            function initialize() {
                Storage.setItem('nonce', vm.nonce);
                var stored = Storage.getItem('cfg');

                if (stored) {
                    populate(stored);
                    return;
                } else {
                    stored = Storage.getItem('sso');
                    if (stored) {
                        vm.SSO.populate(stored);
                        return;
                    }
                }

                vm.API.fetch('POST', 'session/write',{
                        client: vm.cfg.client,
                        nonce: vm.nonce,
                        mobile: true,
                        timestamp: new Date() * 1
                    })
                    .then(
                        function success(response) {
                            if (vm.nonce == response.data.nonce) {
                                populate(response.data, true);
                            } else
                                $log.error('Probably a MITMA - Man in the middle Atack');
                        },
                        function error (response) {
                            $log.error(response)
                        }
                    );
            }

            function populate(data, store) {
                vm.cfg.session = data.token;
                vm.cfg.user = data.username;
                if (store)
                    Storage.setItem('cfg', data);
            }

            if (! valid(arguments))
                return this;

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

            // #### Storage helper
            function StorageInterface() {
                this.setItem = setStorageItem;
                this.removeItem = removeStorageItem;
                this.getItem = getStorageItem;

                function setStorageItem(key, value) {
                    return $window.localStorage.setItem('veridu-' + key, JSON.stringify(value));
                }

                function removeStorageItem(key) {
                    return $window.localStorage.removeItem('veridu-' + key);
                }

                function getStorageItem(key) {
                    try{
                        return JSON.parse($window.localStorage.getItem('veridu-' + key));
                    } catch(e) {
                        $window.localStorage.removeItem('veridu-' + key);
                        return undefined;
                    }
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
