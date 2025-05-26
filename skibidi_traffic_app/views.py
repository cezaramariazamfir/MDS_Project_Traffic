from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib import messages
from django.core.mail import mail_admins
from .forms import SignUpForm
from .forms import CustomAuthenticationForm
from django.contrib.auth.forms import PasswordChangeForm
import logging
from django.views.decorators.csrf import csrf_exempt


logger = logging.getLogger('django')

def home(request):
    #print(settings.BASE_DIR)
    return render(request, 'home.html')

def game(request):
    return render(request, 'game.html')

def profile(request):
    return render(request, 'profile.html')


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

def cityflow_view(request):
    return render(request, 'cityflow.html')

import subprocess
from django.http import JsonResponse
def run_simulation(request):
    try:
        result = subprocess.run([
            'docker', 'run', 
            '-v', 'c:/Users/mceza/Desktop/MDS_Project_Traffic_Cezara/MDS_Project_Traffic_Cezara/cityflow:/workspace',
            '-w', '/workspace/frontend',
            'cityflowproject/cityflow:latest', 'python', 'main.py'
        ], capture_output=True, text=True, check=True)


        return JsonResponse({"status": "ok", "output": result.stdout})
    except subprocess.CalledProcessError as e:
        return JsonResponse({"status": "error", "output": e.stderr}, status=500)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # dezactivează CSRF pentru test, după poți implementa token
def write_roadnet_js(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            content = json.dumps(data, indent=2)
    
            # scrie în fișier (cale relativă la proiect, ajustează după nevoie)
            with open('cityflow/frontend/roadnet.json', 'w', encoding='utf-8') as f:
                f.write(content)
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid method'}, status=405)