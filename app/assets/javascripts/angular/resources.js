//Factory
myApp.factory('Details', ['$resource', function ($resource) {
    return $resource('/profile.json', {}, {
        query: { method: 'GET', isArray: true }
        //create: { method: 'POST' }
    })
}]);

myApp.factory('Users', ['$resource', function ($resource) {
    return $resource('/users.json', {}, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST' }
    })
}]);

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
