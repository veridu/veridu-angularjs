describe('configuration test', function() {
    var sdk,
        provider,
        url;

    beforeEach(function () {

        angular.module('testApp', ['veridu.angularjs.sdk'])
            .config(function (VeriduProvider) {
                VeriduProvider.client = 'client';
                VeriduProvider.user = 'user';
                VeriduProvider.session = 'session';
                VeriduProvider.lang = 'pt-BR';
                VeriduProvider.API_VERSION = 'rafael';
            })
            .run(function (Veridu) {
                sdk = Veridu;
            });

        // Initialize myApp injector
        module('veridu.angularjs.sdk', 'testApp');

        inject(function ($injector) {
            // sdk = $injector.get('Veridu');
        });
    });

    // public properties
    it('should have configured public client', function () {
        expect(sdk.cfg.client).toEqual('client');
        sdk.cfg.client = 'client2';
        expect(sdk.cfg.client).toEqual('client2');
    });

    it('should have configured public user', function () {
        expect(sdk.cfg.user).toEqual('user');
        sdk.cfg.user = 'user2';
        expect(sdk.cfg.user).toEqual('user2');
    });

    it('should have configured public session', function () {
        expect(sdk.cfg.session).toEqual('session');
        sdk.cfg.session = 'session2';
        expect(sdk.cfg.session).toEqual('session2');
    });

    it('should have configured public language', function () {
        expect(sdk.cfg.lang).toEqual('pt-BR');
        sdk.cfg.lang = 'en-us';
        expect(sdk.cfg.lang).toEqual('en-us');
    });

    // protected properties
    it('should have configured protected API version', function () {
        expect(sdk.cfg.API_VERSION).toEqual('rafael');
        sdk.cfg.API_VERSION = 'abc';
        expect(sdk.cfg.API_VERSION).toEqual('rafael');
    });

    it('should have protected API_URL', function () {
        expect(sdk.cfg.URL.api).toEqual('https://api.veridu.com/');
        sdk.cfg.URL.api = 'abc';
        expect(sdk.cfg.URL.api).toEqual('https://api.veridu.com/');
    });

    it('should have protected WIDGET_URL', function () {
        expect(sdk.cfg.URL.widget).toEqual('https://widget.veridu.com/');
        sdk.cfg.URL.widget = 'abc';
        expect(sdk.cfg.URL.widget).toEqual('https://widget.veridu.com/');
    });



});
