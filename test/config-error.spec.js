describe('configuration error test', function() {
    var sdk,
        provider,
        log,
        url;

    beforeEach(function () {

        angular.module('testApp', ['veridu.angularjs.sdk'])
            .config(function (VeriduProvider) {
                // not configuring should throw errors to console
                // VeriduProvider.client = 'client';
            })
            .run(function (Veridu) {
                sdk = Veridu;
            });

        // Initialize myApp injector
        module('veridu.angularjs.sdk', 'testApp');

        inject(function (_$log_) {
            log = _$log_
        });
    });

    it('should throw an console.error if not configured properly', function () {
        expect(log.error.logs).toContain(["Please specify Veridu 'client' on the  confguration phase of your application."]);
    });
});
