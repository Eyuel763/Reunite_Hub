from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MFAEnableView, MFAVerifyView, OAuthLoginView

urlpatterns = [
    # Core Auth Views
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    
    # JWT Refresh Endpoint
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    
    # MFA Endpoints
    path('mfa-enable', MFAEnableView.as_view(), name='mfa_enable'),
    path('mfa-verify', MFAVerifyView.as_view(), name='mfa_verify'),

    # OAuth Login Endpoint
    path('oauth-login', OAuthLoginView.as_view(), name='oauth_login'),
]