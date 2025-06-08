import os
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
from .traffic_env import TrafficEnv
import numpy as np

# === CONFIG ===
MODEL_DIR = "reinforcement_learning/models"
MODEL_NAME = "ppo_traffic_model3"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_NAME)
VECNORM_PATH = os.path.join(MODEL_DIR, "vec_normalize.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)


def create_env(normalize=True, for_training=True, n_envs=8):
    """
    Creează environment cu sau fără normalizare și pentru train/test.
    """
    dummy_env = DummyVecEnv([lambda: TrafficEnv() for _ in range(n_envs)])
    if normalize:
        env = VecNormalize(dummy_env, norm_obs=True, norm_reward=True, clip_reward=10.0)
        env.training = for_training
        env.norm_reward = for_training
    else:
        env = dummy_env
    return env


def load_model():
    """
    Încarcă modelul și VecNormalize dacă există. Altfel creează un model nou.
    """
    if os.path.exists(MODEL_PATH + ".zip") and os.path.exists(VECNORM_PATH):
        print("📦 Încarc modelul antrenat anterior...")
        env = create_env(normalize=False, n_envs=1)  # placeholder pentru load
        env = VecNormalize.load(VECNORM_PATH, env)
        env.training = True
        env.norm_reward = True
        model = PPO.load(MODEL_PATH, env=env)
    else:
        print("🆕 Creez model nou...")
        env = create_env(normalize=True, n_envs=8)
        policy_kwargs = dict(net_arch=[dict(pi=[64, 64], vf=[128, 128])])
        model = PPO(
            "MlpPolicy",
            env,
            verbose=1,
            learning_rate=3e-4,
            ent_coef=0.05,
            policy_kwargs=policy_kwargs,
        )
    return model, env


def train_model(model, env, timesteps=1000):
    """
    Continuă antrenamentul modelului pe baza greutăților curente.
    """
    print("🚀 Continuă antrenamentul...")
    model.learn(total_timesteps=timesteps, progress_bar=True)
    model.save(MODEL_PATH)
    env.save(VECNORM_PATH)
    print(f"✅ Model salvat la: {MODEL_PATH}.zip")
    print(f"✅ VecNormalize salvat la: {VECNORM_PATH}")


def test_model(model, env, steps=10):
    """
    Rulează modelul pentru a face predicții într-un mediu de testare (fără normalizare).
    """
    print("\n🔍 Testare cu normalizare dezactiata...")
    env.training = False
    env.norm_reward = False
    obs = env.reset()
    for _ in range(steps):
        action, _ = model.predict(obs)
        obs, reward, done, info = env.step(action)
        print("Durate:", info[0].get("durations"))
        print("Reward:", reward[0])

import numpy as np

def extract_max_flows(flows_raw):
    flows_raw = flows_raw.get("flows", [])
    max_values = []
    for sublist in flows_raw:
        numeric_values = []
        for val in sublist:
            try:
                numeric_values.append(float(val))
            except (ValueError, TypeError):
                continue
        if numeric_values:
            max_values.append(max(numeric_values))
        else:
            max_values.append(0.0)

    while len(max_values) < 3:
        max_values.append(0.0)

    return np.array(max_values[:3], dtype=np.float32)



def test_utilizator(model, env, data, steps=1):
    obs = extract_max_flows(data).reshape(1, -1)    
    print("📩 Datele primite:", obs)
    env.training = False
    env.norm_reward = False
    for _ in range(steps):
        action, _ = model.predict(obs)
        obs, reward, done, info = env.step(action)
        print("Durate:", info[0].get("durations"))
        print("Reward:", reward[0])



# === USAGE ===
if __name__ == "__main__":
    model, env = load_model()
    train_model(model, env, timesteps=1000)  # continua învățarea
    test_model(model, env, steps=10)         # apoi face predicții
