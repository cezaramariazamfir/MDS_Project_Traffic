import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# === Config ===
LOGIN_URL = "http://127.0.0.1:8000/Skibidi_traffic/login"
CREATE_URL = "http://127.0.0.1:8000/Skibidi_traffic/create"
JSON_PATH = "intersectii_test.json"

# === Încarcă datele din JSON ===
with open(JSON_PATH, "r") as f:
    intersectii = json.load(f)

# === Inițializează browserul ===
driver = webdriver.Chrome()
driver.maximize_window()

# === Login ===
driver.get(LOGIN_URL)
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username"))).send_keys("dima_nou")
driver.find_element(By.NAME, "password").send_keys("pufuini57")
driver.find_element(By.XPATH, "//button[@type='submit']").click()

# === Navighează la pagina de creare ===
WebDriverWait(driver, 10).until(EC.url_changes(LOGIN_URL))
driver.get(CREATE_URL)

print("🔁 Încep testarea...")

for intersectie in intersectii:
    driver.get(CREATE_URL)
    print(f"🛠️ Testez: {intersectie['nume']}")

    canvas = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "canvas"))
    )

    # 🔹 Click pe butonul "Intersectie Custom" ca să activezi desenul
    driver.find_element(By.ID, "intersectieCustom").click()
    time.sleep(0.3)

    # 🔹 Desenezi punctele (și simulezi click pentru fiecare)
    for p in intersectie["puncte"]:
        driver.execute_script(f"""
            var canvas = arguments[0];
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc({p['x']}, {p['y']}, 3, 0, 2 * Math.PI);
            ctx.fill();
        """, canvas)

        driver.execute_script(f"""
            const rect = arguments[0].getBoundingClientRect();
            const x = {p['x']};
            const y = {p['y']};
            const clickEvent = new MouseEvent('click', {{
                clientX: rect.left + x,
                clientY: rect.top + y,
                bubbles: true
            }});
            arguments[0].dispatchEvent(clickEvent);
        """, canvas)

        time.sleep(0.1)

    # 🔹 Apasă din nou butonul pentru a închide forma și a salva intersecția
    driver.find_element(By.ID, "intersectieCustom").click()
    time.sleep(0.5)

    # 🔹 Asigură-te că nu există vreo salvare precedentă
    driver.execute_script("localStorage.removeItem('idIntersectie')")

    # 🔹 Click pe butonul de salvare
    driver.find_element(By.ID, "saveToJSON").click()

    # 🔹 Introdu numele intersecției în prompt
    WebDriverWait(driver, 5).until(EC.alert_is_present())
    alert = driver.switch_to.alert
    alert.send_keys(intersectie["nume"])
    alert.accept()
    
    try:
        WebDriverWait(driver, 3).until(EC.alert_is_present())
        confirm_alert = driver.switch_to.alert
        print(f"📢 Alertă: {confirm_alert.text}")
        confirm_alert.accept()
    except:
        print("ℹ️ Nicio alertă de confirmare de închis.")

    # 🔹 Așteaptă salvarea
    time.sleep(1)

print("✅ Testele s-au terminat.")
driver.quit()
