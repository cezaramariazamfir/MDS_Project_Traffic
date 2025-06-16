from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib import messages
from django.core.mail import mail_admins
from .forms import SignUpForm
from .forms import CustomAuthenticationForm
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.decorators import login_required
import logging
logger = logging.getLogger('django')
from django.http import JsonResponse, HttpResponseBadRequest
import json

def home(request):
    #print(settings.BASE_DIR)
    return render(request, 'home.html')

def game(request):
    return render(request, 'game.html')

@login_required
def profile(request):
    intersectii = IntersectieSalvata.objects.filter(user=request.user).order_by('-data_adaugare')
    return render(request, 'profile.html', {
        'intersectii': intersectii
    })


def aboutus(request):
    return render(request, 'aboutus.html')

from django.contrib.auth.decorators import login_required

from django.utils.timezone import now
@login_required(login_url='login') 
def create(request):
    return render(request, 'create.html', {
        'timestamp': now().timestamp(),  # sau int(time.time())
    })

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)

        # Verificare validitate formular
        if form.is_valid():
            user = form.save()
            login(request, user)  # autentificare automata dupa inregistrare
            return redirect('home')
    else:
        form = SignUpForm()
        
    print(form)
    return render(request, 'signup.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(data=request.POST, request=request)
        if form.is_valid():
            user = form.get_user()
            
            login(request, user)
            if not form.cleaned_data.get('ramane_logat'):
                request.session.set_expiry(0)
            else:
                request.session.set_expiry(24*60*60)  # 1 zi
                
            
            request.session['user_data'] = {
                'username': user.username,
                'first_name' : user.first_name,
                'last_name' : user.last_name,
                'email' : user.email
            }          
            return redirect('profile')
        
    else:
        form = CustomAuthenticationForm()

    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)  # sterg sesiunea utilizatorului
    messages.success(request, "Te-ai delogat cu succes!")
    return redirect('home')

def change_password_view(request):
    if request.method == 'POST':
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, request.user)
            messages.success(request, 'Parola a fost actualizata')
            
            return redirect('home')
        else:
            messages.error(request, 'Exista erori.')
    else:
        form = PasswordChangeForm(user=request.user)
    return render(request, 'change_password.html', {'form': form})

#------------------------------------------------------------------------------

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import IntersectieSalvata
import json

def salvare_intersectie(request):
    if request.method != "POST":
        return JsonResponse({ "error": "Metodă nepermisă" }, status=405)

    try:
        body = json.loads(request.body)
        data = body.get("data")
        id_intersectie = body.get("id")

        if not data:
            return JsonResponse({ "error": "Lipsește câmpul 'data'" }, status=400)

        if id_intersectie:
            try:
                intersectie = IntersectieSalvata.objects.get(id=id_intersectie, user=request.user)
                intersectie.data = data
                intersectie.save()
                return JsonResponse({ "status": "actualizat", "id": str(intersectie.id) })
            except IntersectieSalvata.DoesNotExist:
                return JsonResponse({ "error": "Intersecția nu a fost găsită sau nu aparține utilizatorului." }, status=404)
        else:
            # opțional: fallback dacă nu a fost niciodată salvată
            nume = body.get("nume") or "fara_nume"
            intersectie = IntersectieSalvata.objects.create(user=request.user, nume=nume, data=data)
            return JsonResponse({ "status": "creat", "id": str(intersectie.id) })

    except Exception as e:
        return JsonResponse({ "error": f"Eroare internă: {str(e)}" }, status=500)


from django.http import JsonResponse, Http404
from .models import IntersectieSalvata

def incarca_intersectie(request, id):
    try:
        intersectie = IntersectieSalvata.objects.get(id=id, user=request.user)
        return JsonResponse(intersectie.data, safe=False)
    except IntersectieSalvata.DoesNotExist:
        raise Http404("Intersecția nu a fost găsită sau nu îți aparține.")


from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
import json



from django.utils.safestring import mark_safe
import json

def simuleaza_intersectie(request, id):
    if request.method == 'POST':
        try:
            payload = json.loads(request.body)
            data = payload.get("data", {})

            return render(request, 'simuleaza.html', {
                'intersectie_id': id,
                'data': mark_safe(json.dumps(data))
            })
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON')
        
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from reinforcement_learning.traffic_env import TrafficEnv
from reinforcement_learning.train_ppo import test_utilizator, load_model
from django.http import JsonResponse
import json

# === Model și env încărcate o singură dată la nivel global ===
dummy_env = DummyVecEnv([lambda: TrafficEnv()])
env = VecNormalize.load("reinforcement_learning/models/vec_normalize.pkl", dummy_env)
env.training = False
env.norm_reward = False

model = PPO.load("reinforcement_learning/models/ppo_traffic_model3", env=env)

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def primeste_grupe_semafor(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Am primit din JS:", data)

            model, env = load_model()
            results = test_utilizator(model, env, data)
            try:
                results = [int(round(x)) for x in results]
            except Exception as e:
                print("❌ Eroare la convertirea în int:", str(e))
                results = []
            print(results)
            return JsonResponse({"status": "ok", "results": results})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Metodă invalidă (doar POST)"}, status=405)

def simuleaza(request):
    return render(request, "simuleaza.html")
