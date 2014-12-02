class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  after_filter :set_csrf_cookie_for_ng

  helper_method :current_user, :logged_in, :current_location

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end


  protected

  def verified_request?
    super || form_authenticity_token == request.headers['X-XSRF-TOKEN']
  end


  private

  def current_user_session
    return @current_user_session if defined?(@current_user_session)
    @current_user_session = UserSession.find
  end

  def current_user
    return @current_user if defined?(@current_user)
    @current_user = current_user_session && current_user_session.record
  end

  def logged_in
    unless current_user
      flash[:notice]="Please Login First"
      redirect_to new_user_session_url
    end
  end

  def authorised_user
    if (current_user && !current_user.isadmin)
      flash[:notice]="Please Login First"
      redirect_to accessdenied_users_path
    end
  end

  def un_authorised_user
    if (current_user)
      flash[:alert]="Please Logout First to register"
      redirect_to user_profile_path
    end

  end

  def current_location
    session[:remote_ip] = request[:ip] if (request[:ip] && !Rails.env.production?)
    ip = session[:remote_ip] || request.remote_ip

    session[ip] ||= Geocoder.search(ip).first
  end
end
