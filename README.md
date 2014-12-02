Angular With Rails
==================

Before starting we need these things installed.

  - Ruby ~> 2.0 
  - Rails ~> 4.0
  - MySQL or Postgresql

This is the first rails application in which i am going to use angularjs, in this application a user will be able to do these things:


Functionalities
-----------

These are the functionalities that i am going to imlement in this application:

* Home page for visitors
* Add product
* Display the product list
* User would be able to Register him/her self
* User would be able to Login
* Only authorized users would be able to add, delete and update the products


Project Setup
--------------

```sh
$ rails new rails_with_angular -d=postgresql -T
```
Add it in your Gemfile

```sh
#Use angular js
gem 'angularjs-rails'
gem 'angular-ui-bootstrap-rails'
```

```sh
$ bundle install
$ rake db:create
$ rails generate scaffold Product name:string price:decimal description:text image_url:string
$ rake db:migrate
```
Create a landing page for visitors.

Create the Home controller
-------------------------

```sh
$ rails generate controller home index
```

Our root route right now is just the "Welcome to Rails" page.

##### # config/routes.rb


```sh
# Add the following line in bottom of routes.rb

  root 'home#index'
```

Include Angular Libraries
------------------------
Now we want to tell our application to require the AngularJS files, and we want to make sure it gets loaded before other files that depend on it.
I have removed js

Note: Angular and Turbolinks can conflict with one another, so you can disable them if any issue arises.



```sh
<!-- app/assets/javascripts/application.js -->

// Add the following these lines

//= require angular
//= require angular-route
//= require angular-resource
//= require angular-ui-bootstrap

// I have removed jquery

//= require turbolinks
//= require_tree .
```

Setting up the layout
----------------------
We'll add ng-app and ng-view, which signal that we have an Angular app in our page. Also notice that mentions of Turbolinks have been removed.

```sh
<!DOCTYPE html>
<html ng-app="RailsWithAngular">
<head>
    <title>RailsWithAngular</title>
    <%= stylesheet_link_tag    'application', media: 'all', 'data-turbolinks-track' => true %>
    <%= javascript_include_tag 'application', 'data-turbolinks-track' => true %>
    <%= csrf_meta_tags %>
</head>
<body>
<div class="container" ng-view>
    <%= yield %>
</div>

</body>
</html>

```

Set CSRF cookie for ng
-----------------------

```sh
class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  after_filter  :set_csrf_cookie_for_ng

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  protected

  def verified_request?
    super || form_authenticity_token == request.headers['X-XSRF-TOKEN']
  end
end


```


Creating an Angular controller
----------------------------
Let's create a directory for our controllers. You can name it whatever you want.
```sh
$ mkdir -p app/assets/javascripts/angular/controllers
```
Now let's create the controller file itself. I'm calling this controller the "products controller," and the convention in Angular is to append your controller filenames with Ctrl. Thus our filename will be app/assets/javascripts/angular/controllers/controllers.js.coffee:

```sh
# app/assets/javascripts/angular/controllers/controllers.js


//Controllers

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

```

Add an Angular route
----------------------------
Now we'll add a routing directive in order to make our products#index be our "default page." Here I'm defining my routing in app/assets/javascripts/angular/app.js., but again I don't think the filename matters.

```sh
<!-- app/assets/javascripts/angular/app.js -->

var myApp = angular.module('RailsWithAngular', ['ngRoute', 'ngResource']);

//Routes 

myApp.config([
    '$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/products', {
            templateUrl: '/template/products/index.html',
            controller: 'ProductListCtr'
        });
        $routeProvider.when('/products/new', {
            templateUrl: '/template/products/new.html',
            controller: 'ProductAddCtr'
        });
        $routeProvider.when('/products/:id/edit', {
            templateUrl: '/template/products/edit.html',
            controller: "ProductUpdateCtr"
        });
        $routeProvider.otherwise({
            redirectTo: '/products'
        });
    }
]);

```

Add Angular Resources
----------------------------
A factory which creates a resource object that lets you interact with RESTful server-side data sources.
The returned resource object has action methods which provide high-level behaviors without the need to interact with the low level $http service.

Requires the ngResource module.

You can read more here [https://docs.angularjs.org/api/ngResource/service/$resource]

```sh
<!-- app/assets/javascripts/angular/resources.js -->

//Factory
myApp.factory('Products', ['$resource', function ($resource) {
    return $resource('/products.json', {}, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST' }
    })
}]);

myApp.factory('Product', ['$resource', function ($resource) {
    return $resource('/products/:id.json', {}, {
        show: { method: 'GET' },
        update: { method: 'PUT', params: {id: '@id'} },
        delete: { method: 'DELETE', params: {id: '@id'} }
    });
}]);

```


Add an Angular template folder
-----------------------
We'll also want a place to keep our Angular templates. I decided to put mine in public/template. Again, you can place them wherever you like. 

```sh
mkdir public/template

```

I am going to follow the rails diarectory structure, so i will be creating a separate folder for products public/template/products
```sh
mkdir public/template/products
```
public/template/products/index.html
```sh
<br/>
<div class="row">
    <div class="col-md-12">
        <a class="btn btn-primary" href="#/products/new">Create a product</a>

        <h3 class="block">Products</h3>
        <table class="table table-striped">
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th></th>
            </tr>
            <tr ng-hide="products.length">
                <td colspan="5">No Product found, Please create one.</td>
            </tr>
            <tr ng-show="products.length" ng-repeat="product in products">
                <td>{{product.name}}</td>
                <td>{{product.price}}</td>
                <td>{{product.deacription}}</td>
                <td>
                    <a href="#/products/{{product.id}}/edit">Edit</a> | <a href="" ng-click="deleteProduct(product.id)">Remove</a>
                </td>
            </tr>
        </table>
    </div>
</div>
```



public/template/products/_form.html

```sh
<div class="form-group" ng-class="{'has-error' : submitted && productForm.name.$invalid}">
    <label class="control-label col-md-3">Name <span class="required">* </span> </label>

    <div class="col-md-4">
        <input type="text" name="name" class="form-control" ng-model="product.name" required placeholder="name"/>
    </div>
    <p ng-show=" submitted && productForm.name.$invalid" class="help-block">name is required.</p>
</div>
<div class="form-group" ng-class="{'has-error' : submitted && productForm.price.$invalid}">
    <label class="control-label col-md-3">Price <span class="required">* </span> </label>

    <div class="col-md-4">
        <input type="text" name="price" class="form-control" ng-model="product.price" required placeholder="1.2"/>
    </div>
    <p ng-show="submitted && productForm.price.$error.required" class="help-block">Price is required.</p>

    <p ng-show="submitted && productForm.price.$error.price" class="help-block">Price valid </p>
</div>
<div class="form-group">
    <label class="control-label col-md-3">Description </label>

    <div class="col-md-4">
        <input type="text" name="deacription" class="form-control" ng-model="product.deacription"
               placeholder="description"/>
    </div>
    <p ng-show="submitted && productForm.deacription.$invalid" class="help-block">Description is required.</p>
</div>


<div class="form-group">
    <div class="pull-left">
        <a class="btn btn-default" href="/"> Back</a>
        <button type="submit" class="btn btn-primary" ng-click="submitted=true">Submit</button>
    </div>
</div>
```

public/template/products/new.html

```sh
<div class="col-md-10">
    <form class="tab-pane active form-horizontal" id="first" name="productForm" novalidate ng-submit="save()">
        <h3 class="block">Add new product</h3>
        <div ng-include src="'/templates/products/_form.html'"></div>
    </form>
</div>

```
public/template/products/edit.html

```sh
<div class="col-md-10">
    <form class="tab-pane active form-horizontal" id="first" name="productForm" novalidate ng-submit="update()">
        <h3 class="block">Edit product</h3>
        <div ng-include src="'/templates/products/_form.html'"></div>
    </form>
</div>


```

Now, if you go to http://localhost:3000/  and you should see the contents of products#index.html.

Don't forget to run your server ```rails s``` .

Nex we will be working on authentication...



License
----

A H KHAN...

Feel Free To Use

**Free Software, Hell Yeah!**

