from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static  import serve
from pathlib import Path
from django.conf import settings

BASE_DIR = Path(__file__).resolve().parent.parent

urlpatterns = [
    path('admin/', admin.site.urls),

    # —— 1) Serve pagina HTML cityflow ——
    path(
        'Skibidi_traffic/cityflow/',
        TemplateView.as_view(template_name='cityflow.html'),
        name='cityflow'
    ),

    # —— 2) Serve orice fişier CSS/JS/etc din cityflow/frontend ——
    #     Trebuie să fie direct după pagina HTML, înainte de include-ul aplicației.
    re_path(
        r'^Skibidi_traffic/cityflow/(?P<path>.*)$',
        serve,
        {
            'document_root': BASE_DIR / 'cityflow' / 'frontend',
            'show_indexes': False,
        }
    ),

    # —— 3) Apoi include restul aplicației tale ——
    path("Skibidi_traffic/", include("skibidi_traffic_app.urls")),

    # —— 4) (opțional) alte rute, ex. React ——
    path(
        'react/',
        TemplateView.as_view(template_name='index.html'),
        name='react'
    ),
]
