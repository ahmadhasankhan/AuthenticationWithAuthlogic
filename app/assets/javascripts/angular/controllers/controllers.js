//Controllers

myApp.controller("SignUpCtr", ['$scope', '$resource', 'Users', '$location', function ($scope, $resource, Users, $location) {

    $scope.user = {username: '', email: '', password: '', password_confirmation: ''};
    $scope.save = function () {
        if ($scope.userForm.$valid) {
            Users.create({user: $scope.user}, function () {
                $location.path('/profile');
            }, function (error) {
                console.log(error)
            });
        }
    }
}]);

myApp.controller("GetUserCtr", ['$scope', '$http', '$resource', 'Details', '$location', function ($scope, $http, $resource, Details, $location) {
//    $scope.details = Details.query();
//    alert($scope);

    Details.query(function (res) {
        $scope.details = res.user.data;
        //alert(res);
    }, function (error) {
        alert(error);
    });


    //Log out all the titles.
//    $scope.details.forEach(function (user) {
//        console.log(user.username);
//    });
}]);


myApp.controller("ProductListCtr", ['$scope', '$http', '$resource', 'Products', 'Product', '$location', function ($scope, $http, $resource, Products, Product, $location) {

    $scope.products = Products.query();

    $scope.deleteProduct = function (ProductId) {
        if (confirm("Are you sure you want to delete this Product?")) {
            Product.delete({ id: ProductId }, function () {
                $scope.products = Products.query();
                $location.path('/');
            });
        }
    };
}]);

myApp.controller("ProductUpdateCtr", ['$scope', '$resource', 'Product', '$location', '$routeParams', function ($scope, $resource, Product, $location, $routeParams) {
    $scope.product = Product.get({id: $routeParams.id})
    $scope.update = function () {
        if ($scope.productForm.$valid) {
            Product.update({id: $scope.product.id}, {product: $scope.product}, function () {
                $location.path('/');
            }, function (error) {
                console.log(error)
            });
        }
    };
}]);

myApp.controller("ProductAddCtr", ['$scope', '$resource', 'Products', '$location', function ($scope, $resource, Products, $location) {

    $scope.product = {name: '', price: '', deacription: ''};
    $scope.save = function () {
        if ($scope.productForm.$valid) {
            Products.create({product: $scope.product}, function () {
                $location.path('/');
            }, function (error) {
                console.log(error)
            });
        }
    }
}]);
