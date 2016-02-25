'use strict';

/* JAVASCRIPT FUNCTIONS */
function imgLoaded(img) {
   //console.log(img);
   var imgWrapper = img.parentNode;
   imgWrapper.className += imgWrapper.className ? ' loaded' : 'loaded';
};


/* ANGULAR APP */
var app = angular.module('app', [
  'ngRoute',
  'ngAnimate',
  'ngMaterial',
  'appControllers',
  'angular-google-analytics',
  'mailchimp'
]);


app.constant('settings', {
   title: 'Andy Beck'
});


/* CONFIG */
app.config(['AnalyticsProvider', 
   function (AnalyticsProvider) {
      AnalyticsProvider.setAccount('UA-5805009-5');
   }
]);

app.config(['$routeProvider', '$locationProvider', '$provide',
   function ($routeProvider, $locationProvider, $provide) {

      $routeProvider
         .when('/gallery/:itemCategory', {
            templateUrl: 'partials/list.html',
            controller: 'ListCtrl'
         })
         .when('/gallery/:itemCategory/:itemUrl', {
            templateUrl: 'partials/detail.html',
            controllerAs: 'detail',
            controller: 'DetailCtrl'
         })
         .when('/about', {
            title: 'About',
            templateUrl: 'partials/about.html',
            controller: 'PageCtrl'
         })
         .when('/news', {
            title: 'News',
            templateUrl: 'partials/news.html',
            controller: 'PageCtrl'
         })
         .when('/contact', {
            title: 'Contact',
            templateUrl: 'partials/contact.html',
            controller: 'ContactCtrl'
         })
         .otherwise({
            redirectTo: '/',
            templateUrl: 'partials/home.html',
            controller: 'PageCtrl'
         });

      $locationProvider
         .html5Mode(true);

      /*$provide.decorator('$sniffer', function ($delegate) {
         $delegate.history = false; // set false to spoof Hashbang in HTML5 Mode
         return $delegate;
      });*/

   }
]);


/* DIRECTIVES */
app.directive('navBar', function () {
   return {
      templateUrl: 'partials/nav.html'
   };
});

app.directive('footer', function () {
   return {
      template: '<p ng-controller="FooterCtrl" ng-bind-html="footer"></p>'
   };
});

app.directive('svgInclude', function () {
   return {
      templateUrl: 'partials/svg.html'
   };
});

app.directive('clickOutside', ['$document', '$parse', clickOutside]);
   //github.com/IamAdamJowett/angular-click-outside
   function clickOutside($document, $parse) {
      return {
         restrict: 'A',
         link: function ($scope, elem, attr) {
            var classList = (attr.outsideIfNot !== undefined) ? attr.outsideIfNot.replace(', ', ',').split(',') : [],
                fn = $parse(attr['clickOutside']);

            // add the elements id so it is not counted in the click listening
            if (attr.id !== undefined) {
               classList.push(attr.id);
            }

            var eventHandler = function (e) {

               //check if our element already hiden
               if (angular.element(elem).hasClass("ng-hide")) {
                  return;
               }

               var i = 0,
                   element;

               // if there is no click target, no point going on
               if (!e || !e.target) {
                  return;
               }

               // loop through the available elements, looking for classes in the class list that might match and so will eat
               for (element = e.target; element; element = element.parentNode) {
                  var id = element.id,
                      classNames = element.className,
                      l = classList.length;

                  // Unwrap SVGAnimatedString
                  if (classNames && classNames.baseVal !== undefined) {
                     classNames = classNames.baseVal;
                  }

                  // loop through the elements id's and classnames looking for exceptions
                  for (i = 0; i < l; i++) {
                     // check for id's or classes, but only if they exist in the first place
                     if ((id !== undefined && id.indexOf(classList[i]) > -1) || (classNames && classNames.indexOf(classList[i]) > -1)) {
                        // now let's exit out as it is an element that has been defined as being ignored for clicking outside
                        return;
                     }
                  }
               }

               // if we have got this far, then we are good to go with processing the command passed in via the click-outside attribute
               return $scope.$apply(function () {
                  return fn($scope);
               });
            };

            // assign the document click handler to a variable so we can un-register it when the directive is destroyed
            $document.on('click', eventHandler);

            // when the scope is destroyed, clean up the documents click handler as we don't want it hanging around
            $scope.$on('$destroy', function () {
               $document.off('click', eventHandler);
            });
         }
      };
   }
;


/* FACTORIES */
app.factory('utilities', function () {
   function splitName(fullName) {
      var formData = {},
        nameArr = fullName.split(' ');
      if (nameArr.length == 1) {
         formData.first_name = nameArr[0];
         formData.last_name = '';
      } else if (nameArr.length > 2) {
         formData.last_name = nameArr.pop();
         formData.first_name = nameArr.join(' ');
      } else {
         formData.first_name = nameArr[0];
         formData.last_name = nameArr[nameArr.length - 1];
      }
      return formData;
   }
   return {
      splitName: splitName
   }
});

app.factory('sortData', ['$http',
   function ($http) {
   var items = [];
   return {
      getItems: function () {
         return $http.get('data/gallery.json').then(function (response) {
            items = response.data;

            /* sort items by date in descending order */
            items.sort(function (a, b) {
               return b.date.localeCompare(a.date);
            });
            
            return {
               items: items
            };
         })
      },
      saveItems: function () { }
   };
}]);


/* RUN */
app.run(['$rootScope', 'settings', function ($rootScope, settings) {
   $rootScope.page = {
      setTitle: function (title) {
         this.title = title + ' | ' + settings.title;
      },
      setDirection: function (direction) {
         this.direction = direction;
      },
      showSubNav: function (subNavShow) {
         this.subNavShow = subNavShow;
      }
   }
   $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
      $rootScope.page.title = current.$$route ? current.$$route.title + ' | ' + settings.title : settings.title;
   });
}]);

app.run(function (Analytics) { });


/* ANIMATION */
app.animation('.slide', function () {
   return {
      beforeAddClass: function (element, className, done) {
         if (className === 'ng-hide') {
            element.slideUp({ duration: 350 }, done);
         }
      },
      removeClass: function (element, className, done) {
         if (className === 'ng-hide') {
            element.hide().slideDown({ duration: 350 }, done);
         }
      }
   }
});
