function loadingInterceptor($q, $injector) {
  let http;
  let usSpinnerService;
  let timeout;

  return {
    request(config) {
      // console.log('request config:', config);
      if (config.ignoreLoadingIndicator !== true) {
        usSpinnerService = usSpinnerService || $injector.get('usSpinnerService');
        timeout = timeout || $injector.get('$timeout');

        timeout(() => {
          usSpinnerService.spin('spinner-1');
          // console.log('start spinner for', config.method, config.url);
        });
      }

      return config;
    },

    response(response) {
      // console.log('response:', response);
      // console.log('end', response.config.method, response.config.url);

      http = http || $injector.get('$http');
      usSpinnerService = usSpinnerService || $injector.get('usSpinnerService');
      timeout = timeout || $injector.get('$timeout');

      // console.log('$http.pendingRequests.length:', http.pendingRequests.length);

      if (http.pendingRequests.length < 1) {
        timeout(() => {
          // console.log('stop spinner for', response.config.method, response.config.url);
          usSpinnerService.stop('spinner-1');
        });
      }

      return response;
    },

    responseError(response) {
      // console.log('response:', response);
      http = http || $injector.get('$http');
      usSpinnerService = usSpinnerService || $injector.get('usSpinnerService');

      console.log('error $http.pendingRequests.length:', http.pendingRequests.length);

      if (http.pendingRequests.length < 1) {
        timeout(() => {
          // console.log('stop spinner for', response.config.method, response.config.url);
          usSpinnerService.stop('spinner-1');
        });
      }

      return $q.reject(response);
    },
  };
}

loadingInterceptor.$inject = ['$q', '$injector'];

function osLoadingIndicator() {
  return {
    scope: {
      options: '=?',
    },
    template: '<span us-spinner="options" spinner-key="spinner-1"></span>',

    link(scope) {
      if (!scope.options) {
        scope.options = { radius: 20, width: 4, length: 8, lines: 13 };
      }
    },
  };
}

const loadingIndicator = angular.module('os-loading-indicator', ['angularSpinner', 'ui.bootstrap'])
  .factory('loadingInterceptor', loadingInterceptor)
  .config(['$httpProvider', ($httpProvider) => {
    $httpProvider.interceptors.push(loadingInterceptor.name);
  }])
  .directive('osLoadingIndicator', osLoadingIndicator);

const app = angular.module('myapp', [loadingIndicator.name]);

app.controller('MyController', ['$scope', 'usSpinnerService', '$http', '$rootScope',
  function($scope, usSpinnerService, $http, $rootScope) {
    $scope.startSpin = function() {
      usSpinnerService.spin('spinner-1');
    };

    $scope.stopSpin = function() {
      usSpinnerService.stop('spinner-1');
    };

    $scope.fetch = function() {
      $http.get('http://internal.dev.aliyuncs.com/v3/innerapi/scheduled-tasks?size=40').then(function(tasks){
          $scope.tasks = tasks;
      });
    };
    
    function main() {
      $scope.fetch();
    }
    main();
  }
]);
