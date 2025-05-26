import cityflow
import time
# Încarcă simulatorul
engine = cityflow.Engine("config.json", thread_num=1)

import os
print("CWD:", os.getcwd())
print("Expected path to roadnet:", os.path.join("frontend", "roadnet.json"))

intersection_id = "intersection_1"
phases = [0, 1]  # fazele definite în roadnet.json
current_phase = 0
steps_per_phase = 10  # schimbăm faza la fiecare 10 pași

for step in range(100):
    
    # schimbă faza la fiecare 10 timesteps
    if step % steps_per_phase == 0:
        current_phase = phases[(step // steps_per_phase) % len(phases)]
        engine.set_tl_phase(intersection_id, current_phase)
        print(f"[Step {step}] Set traffic light phase to {current_phase}")

    # avansează simularea
    engine.next_step()
    time.sleep(0.05)  # opțional: încetinește rularea pentru claritate
