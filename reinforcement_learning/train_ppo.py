import os
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from traffic_env import TrafficEnv

# Creează mediul vectorizat (PPO cere VecEnv)
env = make_vec_env(TrafficEnv, n_envs=1)
number_arguments = env.observation_space.shape[0] - 1

# Creează modelul PPO
model_path = os.path.abspath(f"reinforcement_learning/models/ppo_traffic_model{number_arguments}")

# Încarci modelul
model = PPO.load(model_path, env=env, device="cuda")

# Antrenează modelul
model.learn(total_timesteps=100, progress_bar=True)

# === SALVARE MODEL ===
model_dir = "reinforcement_learning/models"
model_path = os.path.join(model_dir, f"ppo_traffic_model{number_arguments}")

# Creează folderul dacă nu există
os.makedirs(model_dir, exist_ok=True)

# Salvează modelul
model.save(model_path)
print(f"✅ Model salvat la: {model_path}.zip")

# === TESTARE MODEL ===
obs = env.reset()
for _ in range(1000):
    action, _ = model.predict(obs)
    obs, reward, done, info = env.step(action)
    print("Reward:", reward[0])  # extragem din array

