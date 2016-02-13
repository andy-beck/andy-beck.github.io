/* JAVASCRIPT FUNCTIONS */
function imgLoaded(img) {
   var imgWrapper = img.parentNode;
   imgWrapper.className += imgWrapper.className ? ' loaded' : 'loaded';
};


/* ANGULAR APP */
var app = angular.module('app', [
  'ngRoute',
  'ngAnimate',
  'ngMaterial',
  'appControllers',
  'mailchimp'
]);


app.config(['$routeProvider',
  function ($routeProvider) {
     $routeProvider.
       when('/gallery/:itemCategory', {
          templateUrl: 'partials/list.html',
          controller: 'ListCtrl'
       }).
       when('/gallery/:itemCategory/:itemUrl', {
          templateUrl: 'partials/detail.html',
          controllerAs: 'detail',
          controller: 'DetailCtrl'
       }).
       when('/about', {
          title: 'About',
          templateUrl: 'partials/about.html',
          controller: 'PageCtrl'
       }).
       when('/news', {
          title: 'News',
          templateUrl: 'partials/news.html',
          controller: 'PageCtrl'
       }).
       when('/contact', {
          title: 'Contact',
          templateUrl: 'partials/contact.html',
          controller: 'ContactCtrl'
       }).
       otherwise({
          redirectTo: '/',
          templateUrl: 'partials/home.html',
          controller: 'PageCtrl'
       });
  }
]);


app.directive("navBar", function () {
   return {
      templateUrl: "partials/nav.html"
   };
});

app.directive("svgInclude", function () {
   return {
      templateUrl: "partials/svg.html"
   };
});


app.run(['$rootScope',
  function ($rootScope) {
     $rootScope.page = {
        setTitle: function (title) {
           this.title = title + ' | Andy Beck';
        },
        setDirection: function (direction) {
           this.direction = direction;
        },
        showSubNav: function (subNavShow) {
           this.subNavShow = subNavShow;
        }
     }
     $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.page.title = current.$$route ? current.$$route.title + ' | Andy Beck' : 'Andy Beck';
     });
  }
]);


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


app.factory('sortData', ['$http', '$rootScope', '$filter', '$routeParams', function ($http, $rootScope, $filter, $routeParams) {
   var items = [];
   return {
      getItems: function () {
         return $http.get('data/gallery.json').then(function (response) {

            items = response.data;
            /* sort items by date in descending order */
            items.sort(function (a, b) {
               return b.date.localeCompare(a.date);
            });

            $rootScope.$broadcast('updateCategory', items);

            return {
               items: items
            };
         })
      },
      saveItems: function () { }
   };
}]);


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


//app.animation('.slide', ['$animateCss',
//  function ($animateCss) {
//    return {
//      addClass: function (element, className, done) {
//        if (className == 'ng-hide') {
//          var animator = $animateCss(element, {
//            to: { height: '0px', opacity: 0 }
//          });
//          if (animator) {
//            return animator.start().done(function () {
//              element[0].style.height = '';
//              done();
//            });
//          }
//        }
//        done();
//      },
//      removeClass: function (element, className, done) {
//        if (className == 'ng-hide') {
//          var height = element[0].offsetHeight;
//          var animator = $animateCss(element, {
//            from: { height: '0px', opacity: 0 },
//            to: { height: height + 'px', opacity: 1 }
//          });
//          if (animator) {
//            return animator.start().done(done);
//          }
//        }
//        done();
//      }
//    };
//  }
//]);
