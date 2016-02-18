describe('API Request', function() {
    var sdk,
        provider,
        url;

    beforeEach(function () {

        angular.module('testApp', ['veridu.angular.sdk'])
            .config(function (VeriduProvider) {
                VeriduProvider.client = 'client';
                VeriduProvider.user = 'user';
                VeriduProvider.session = 'session';
            })
            .run(function (Veridu) {
                sdk = Veridu
            });

        // Initialize myApp injector
        module('veridu.angular.sdk', 'testApp');

        inject(function ($injector) {
            $http = $injector.get('$http');
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
        });
    });

    it('should have configured user after request', function () {

        // test if profile URL is OK
        $httpBackend
            .expectGET('https://api.veridu.com/0.3/profile/user/')
            .respond({"status":true,"state":"IDLE","user": null,"provider":[],"kba":[],"otp":[],"updated":null});

        var resource = 'profile/' + sdk.cfg.user;

        var promise = sdk.API.fetch('GET', resource);
        promise.then(function (response) {
            expect(response.data.user).toEqual(null);
        });

        $httpBackend.flush();
        $rootScope.$digest();
    });

});
