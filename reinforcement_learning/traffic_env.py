import gym
import numpy as np
from gym import spaces

class TrafficEnv(gym.Env):
    def __init__(self):
        super(TrafficEnv, self).__init__()

        self.num_phases = 2  # Număr de faze de semafor
        self.min_duration = 3
        self.max_duration = 30

        # Observație: trafic pe fiecare fază (fără current_phase)
        self.observation_space = spaces.Box(
            low=0, high=100,
            shape=(self.num_phases,),
            dtype=np.float32
        )

        # Acțiune: durată propusă pentru fiecare fază
        self.action_space = spaces.Box(
            low=1.0,
            high=30.0,
            shape=(self.num_phases,),
            dtype=np.float32
        )

        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)

        # Trafic inițial pe fiecare fază
        # self.traffic = np.array([30, 30, 30], dtype = np.float32)
        self.traffic = np.random.randint(25, 30, size=self.num_phases).astype(np.float32)


        return self.traffic.copy(), {}

    def step(self, action):
        # Salvează traficul anterior pentru calculul delta
        previous_traffic = self.traffic.copy()

        # Asigurăm că duratele sunt în intervalul valid
        durations = np.clip(action, self.min_duration, self.max_duration).astype(np.float32)

        total_passed = 0.0

        # Aplicăm fiecare fază în ordine
        for phase in range(self.num_phases):
            duration = durations[phase]
            effective_time = max(0.0, duration - 2.0)  # scădem timpul mort
            capacity = effective_time * 1.5  # mașini care pot trece

            passed = min(self.traffic[phase], capacity)
            self.traffic[phase] -= passed
            total_passed += passed

        # Adaugă trafic nou aleatoriu pe toate fazele
        # Adaugă trafic nou aleatoriu controlabil (între 0 și 5 mașini pe fază)
        self.traffic += np.random.randint(3, 6, size=self.num_phases).astype(np.float32)
        # fix, controlabil
        self.traffic = np.clip(self.traffic, 0, 100)

        # Calculează îmbunătățirea în trafic
        delta_traffic = np.sum(previous_traffic) - np.sum(self.traffic)

        # Calculează recompensa
        reward = total_passed +  0.7 * delta_traffic - 0.2 * np.sum(durations)

        assert not np.any(np.isnan(self.traffic)), "NaN in traffic"
        assert not np.any(np.isnan(durations)), "NaN in durations"
        assert not np.isnan(reward), "NaN in reward"

        obs = self.traffic.copy()
        terminated = False
        truncated = False
        info = {
            "durations": durations.tolist(),
            "passed_total": total_passed,
            "delta_traffic": delta_traffic,
            "raw_reward": reward
        }

        return obs, reward, terminated, truncated, info
