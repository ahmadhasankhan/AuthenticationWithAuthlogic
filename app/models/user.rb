class User < ActiveRecord::Base

  #attr_accessor :password, :password_confirmation

  acts_as_authentic do |c|
    c.validate_login_field = false
    #c.validate_password_field = true
  end
  #before_save :encrypt_password
end
