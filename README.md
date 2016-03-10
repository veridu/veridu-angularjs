Veridu AngularJS SDK
==============

Installation
------------
This library can be found on [npm](https://www.npmjs.com/package/veridu-angularjs-sdk).

The recommended way to install this is through [npm](https://www.npmjs.com/package/veridu-angularjs-sdk):
```bash
$ npm install --save veridu-angularjs-sdk
```
Or through [bower](http://bower.io/):
```bash
$ bower install --save veridu-angularjs-sdk
```

Installing in your project
------------

Via scripts:
````html
<script src="js/angular/angular.js" charset="utf-8"></script>
<script src="js/veridu-angularjs-sdk/dist/veridu-angularjs-sdk.min.js" charset="utf-8"></script>
````

Via [browserify](http://browserify.org/):
````javascript
require('angular');
require('veridu-angularjs-sdk');
````

Usage
------------
```javascript
// On your App initialization
angular.module('YourApp', [
    'veridu.angularjs.sdk'
]);

// On your App configuration phase
angular.module('YourApp').config(function (VeriduProvider){
    VeriduProvider.client = 'YOUR_CLIENT_ID';
})

// On a controller
AppCtrl.$inject = ['Veridu'];
function AppCtrl(Veridu) {
    var vm = this;
    vm.getProfile = getProfile;
    vm.login = login;

    // fetches user profile
    function getProfile() {
        Veridu.API.fetch('GET', 'profile/' + Veridu.cfg.user).then(
            function success(response) {
                vm.profile = response.data;
            },
            function error() {
                // error handling
            }
        );
    }

    // Facebook SSO
    function login() {
        return Veridu.SSO.login('facebook');
    }

}
```
Facebook SSO:
````html
    <button type="button" ng-click="App.login()"></button>
````

Examples
--------
Examples of basic usage are located in the file `examples/index.html`. It's highly recommended to take a look at it.

Code documentation
------------------
Latest code documentation can be found [here](http://htmlpreview.github.io/?https://github.com/veridu/veridu-angularjs/blob/master/doc/src/veridu-angularjs-sdk.html).

Features
--------
- SSO in minutes
- Query [endpoints](https://veridu.com/wiki/Category:Endpoint) easily
- Highly configurable

Bugs and feature requests
-------------------------
Have a bug or a feature request? [Please open a new issue](https://github.com/veridu/veridu-angularjs/issues).
Before opening any issue, please search for existing issues and read the [Issue Guidelines](https://github.com/necolas/issue-guidelines), written by [Nicolas Gallagher](https://github.com/necolas/).

Versioning
----------
This SDK will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backward compatibility bumps the major (and resets the minor and patch)
* New additions without breaking backward compatibility bumps the minor (and resets the patch)
* Bug fixes and misc changes bumps the patch

For more information on SemVer, please visit [http://semver.org/](http://semver.org/).

Tests
-----
To run the tests, you must first install [Karma](https://karma-runner.github.io/0.13/index.html) globally, then install dependencies with `npm install --dev` then:
````bash
$ karma start
````

Copyright and license
---------------------

Copyright © 2016 - Veridu Ltd - [http://veridu.com](veridu.com)
