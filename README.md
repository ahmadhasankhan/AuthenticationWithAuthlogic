Authentication Using AuthLogic With Rails-4
===========================

Before starting we need these things installed.

  - Ruby ~> 2.0.x
  - Rails ~> 4.1.x
  - MySQL or Postgresql

##### Follow along:
Create a new `rails` application- 
```
$ rails new login_application
$ cd login_application
$ vim Gemfile
```
Add `authlogic` dependency somewhere in your gem file

`gem 'authlogic'`

```
source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.5'
# Use mysql as the database for Active Record
gem 'mysql2', '>= 0.3.13', '< 0.5'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.1.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 0.4.0', group: :doc

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console', '~> 2.0'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
end

#For Authentication
gem 'authlogic'
```
Install dependencies
```
$ bundle install
```
Next we’ll generate `user` model, controllers, and views
```
rails generate scaffold User email:string crypted_password:string password_salt:string persistence_token:string authentication_token:string perishable_token:string single_access_token:string login_count:integer failed_login_count:integer last_request_at:datetime current_login_at:datetime last_login_at:datetime current_login_ip:string last_login_ip:string active:boolean confirmed:boolean
```

#### Optional Fields:
You can remove thees fields if you don't need them. 
```
      # Authlogic::Session::MagicColumns
      t.integer   :login_count, default: 0, null: false
      t.integer   :failed_login_count, default: 0, null: false
      t.datetime  :last_request_at
      t.datetime  :current_login_at
      t.datetime  :last_login_at
      t.string    :current_login_ip
      t.string    :last_login_ip

      # Authlogic::Session::MagicStates
      t.boolean   :active, default: false
      t.boolean   :approved, default: false
      t.boolean   :confirmed, default: false
```

Once you run the `User` scaffold, you will get some new file created in your rails app:

```
      invoke  active_record
      create    db/migrate/20151220024518_create_users.rb
      create    app/models/user.rb
      invoke    test_unit
      create      test/models/user_test.rb
      create      test/fixtures/users.yml
      invoke  resource_route
       route    resources :users
      invoke  scaffold_controller
      create    app/controllers/users_controller.rb
      invoke    erb
      create      app/views/users
      create      app/views/users/index.html.erb
      create      app/views/users/edit.html.erb
      create      app/views/users/show.html.erb
      create      app/views/users/new.html.erb
      create      app/views/users/_form.html.erb
      invoke    test_unit
      create      test/controllers/users_controller_test.rb
      invoke    helper
      create      app/helpers/users_helper.rb
      invoke      test_unit
      invoke    jbuilder
      create      app/views/users/index.json.jbuilder
      create      app/views/users/show.json.jbuilder
      invoke  assets
      invoke    coffee
      create      app/assets/javascripts/users.coffee
      invoke    scss
      create      app/assets/stylesheets/users.scss
      invoke  scss
      create    app/assets/stylesheets/scaffolds.scss
```
Migrate database
```
$ rake db:migrate
```
It's good time to run your rails serve if you haven’t started yet and have a look what you have done sofar
```
$ rails s
#Go to:
http://localhost:3000/users
```
Lets add a global register link so that anybody logged out can register easily. Open your `/app/views/layouts/application.html.erb` file to look like this:

```
<!DOCTYPE html>
<html>
<head>
  <title>WalletManager</title>
  <%= stylesheet_link_tag    'application', media: 'all', 'data-turbolinks-track' => true %>
  <%= javascript_include_tag 'application', 'data-turbolinks-track' => true %>
  <%= csrf_meta_tags %>
</head>
<body>
<%= link_to "Register", new_user_path %>
<%= yield %>

</body>
</html>

```

* Go to `app/views/users/_form.html.erb` remove unwanted fields and add password and password confirmation field.

```
#app/views/users/_form.html.erb

<%= form_for(@user) do |f| %>
  <% if @user.errors.any? %>
    <div id="error_explanation">
      <h2><%= pluralize(@user.errors.count, "error") %> prohibited this user from being saved:</h2>
      <ul>
      <% @user.errors.full_messages.each do |message| %>
        <li><%= message %></li>
      <% end %>
      </ul>
    </div>
  <% end %>
  
  <div class="field">
    <%= f.label :email %><br>
    <%= f.text_field :email %>
  </div>
  <div class="field">
    <%= f.label :password %><br>
    <%= f.password_field :password %>
  </div>
  <div class="field">
    <%= f.label :password_confirmation %><br>
    <%= f.password_field :password_confirmation %>
  </div>

  <div class="actions">
    <%= f.submit %>
  </div>
<% end %>
```
We have changed the field name from `crypted_password` to `password` and `password_salt` to `password_confirmation`. `Authlogic` will map the :password field to :crypted_password after hashing it. We also changed the field type from f.text_field to f.password_field, this will create your standard password input field instead of a plain text input field. We have also added a :password_confirmation field.

Lets remove same from `user_params` and add newly added
```
#app/controllers/users_controller.rb
 -----
  ---CRUD Methods---
     -----
    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation)
    end
```
Add this in your user model
```
#app/models/user.rb
   acts_as_authentic do |c|
     c.login_field = :email
   end
```
Try to register with an invalid e-mail address.
Authlogic adds in auto e-mail validation on email forms, as well as some other basic settings that you can change.

Now lets create our first account. As you can see it has displayed our hashed passwords and some other data that no user really needs to be bothered with. 
Lets clean it up...
```
#app/views/users/index.html.erb

<p id="notice"><%= notice %></p>
<h1>Listing Users</h1>
<table>
  <thead>
    <tr>
      <th>Email</th>
      <th colspan="3"></th>
    </tr>
  </thead>
  <tbody>
    <% @users.each do |user| %>
      <tr>
        <td><%= user.email %></td>
        <td><%= link_to 'Show', user %></td>
        <td><%= link_to 'Edit', edit_user_path(user) %></td>
        <td><%= link_to 'Destroy', user, method: :delete, data: { confirm: 'Are you sure?' } %></td>
      </tr>
    <% end %>
  </tbody>
</table>
<br>
<%= link_to 'New User', new_user_path %>
```
### Where’s my session?

We’re going to create a separate controller and model to handle our `session` handling logic. Since the user model contains all the information about our tracked object, we can just create an `empty` model called `user_session`, run the following command


```
$ rails g model user_session
$ rails g scaffold_controller user_session email:string password:string

#Delete the generated migration file
$ rm db/migrate/20151220035256_create_user_sessions.rb
```

Extend `Authlogic::Session::Base` in your UserSession model

```
#app/models/user_session.rb
class UserSession < Authlogic::Session::Base
  # specify configuration here, such as:
  # logout_on_timeout true
  # ...many more options in the documentation
end
```

Currently the login and logout functions are stored at user_session/create and user_session/destroy, not very pretty. Lets open up config/routes.rb and set up some cleaner urls. Your file should look like this:

```
#/config/routes.rb

  match 'login' => 'user_sessions#new', :as => :login, via: [:get, :post]
  match 'logout' => 'user_sessions#destroy', :as => :logout, via: [:get, :post]
```

Now lets create the login link. We’ll want this link available everywhere, right next to our Register link preferably. Open up `app/views/layouts/application.html.erb`, and add this beside register link.

```
<%= link_to "Login", login_url %>
```

### Refrences:
https://github.com/binarylogic/authlogic
