class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username
      t.string :subdomain
      t.string :email
      t.string :crypted_password
      t.string :password_salt
      t.string :persistence_token
      t.string :authentication_token
      t.string :provider
      t.string :uid
      t.boolean :isadmin


      t.timestamps
    end
  end
end
