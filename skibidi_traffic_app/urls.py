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
    path('saved/', views.salvare_intersectie, name='saved'),
    path('incarca/<uuid:id>/', views.incarca_intersectie, name='incarca'),
    path('simuleaza_intersectie/<uuid:id>/', views.simuleaza_intersectie, name='simuleaza_intersectie'),
    path("js_to_py", views.primeste_grupe_semafor, name="primeste_grupe_semafor"),
    path('simuleaza/', views.simuleaza, name='simuleaza')
]

from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)