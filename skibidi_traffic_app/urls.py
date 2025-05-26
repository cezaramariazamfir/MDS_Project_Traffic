from django.urls import include, path
from . import views

urlpatterns = [
    path('home', views.home, name='home'),
    path('profile', views.profile, name='profile'),
    path('signup', views.signup_view, name='signup'),
    path('login', views.login_view, name='login'),
    path('aboutus', views.aboutus, name='aboutus'),
    path('logout', views.logout_view, name='logout'),
    path('changepassword', views.change_password_view, name='changepassword'),
    path('game', views.game, name='game'),
    path('create', views.create, name='create'),
    path('cityflow/', views.cityflow_view, name='cityflow'),
    path('run-simulation/', views.run_simulation, name='run_simulation'),
    path('write_roadnet_js/', views.write_roadnet_js, name='write_roadnet_js'),
]

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)