import gym
import numpy as np
from gym import spaces

class TrafficEnv(gym.Env):
    def __init__(self):
        super(TrafficEnv, self).__init__()

        self.num_phases = 3  # Faze de semafor: 0-3
        self.min_duration = 3
        self.max_duration = 30
        self.duration_bins = self.max_duration - self.min_duration + 1  # 18 valori: 3s...20s

        #cum va arata vectorul care se trimite catre ppo(minim 0, maxim 100, iar asta acum este 5, si ca elementele array ului sunt pe 32 de biti)
        self.observation_space = spaces.Box(
            low=0, high=100,
            shape=(4,), dtype=np.float32
        )

        #rl ul trebuie sa aleaga un self.num_phases si un self.duratiion_bins(faza si durata) (CE TREBUIE SA RETURNEZE)
        self.action_space = spaces.MultiDiscrete([self.num_phases, self.duration_bins])

        self.reset()

    #se face la inceputul fiecarui episod
    def reset(self, seed=None, options=None):
        super().reset(seed=seed) #apeleaza metoda reset din clasa parinte(gym.Env)
        self.traffic = np.random.randint(0, 30, size=3).astype(np.float32)  # cate mașini vin pe N, E, S, V
        self.current_phase = 0 #mereu sa inceapa de la faza de inceput
        self.time = 0
        return self._get_obs(), {}  # returneaza rezultatul functiei _get_obs() adica dictionarul cu masinile si starea curenta

    def _get_obs(self):
        # Returnează starea: [trafic_N, E, S, V, faza_actuală]
        return np.append(self.traffic, self.current_phase).astype(np.float32)

    def step(self, action):  #e apelata intern si de antrenare si de testare
        # decizia rl ului la step ul anterior(action vine din predict)
        phase = int(action[0])
        duration_discrete = int(action[1])
        duration = self.min_duration + duration_discrete  # convertim la durată reală

        effective_time = max(0.0, duration - 2.0) #-2 sec pentru timpul mort

        # Procesare: eliberează mașini pe direcția fazei alese
        passed = 0 #initializam cate maisni pot trece
        if phase == 0:
            passed = min(self.traffic[0], effective_time * 1.5) #minimul dintere cate masini exista si cate masini pot trece efectiv
            self.traffic[0] -= passed
        elif phase == 1:
            passed = min(self.traffic[1], effective_time * 1.5)
            self.traffic[1] -= passed
        elif phase == 2:
            passed = min(self.traffic[2], effective_time * 1.5)
            self.traffic[2] -= passed
        elif phase == 3:
            passed = min(self.traffic[3], effective_time * 1.5)
            self.traffic[3] -= passed

        # Adaugă trafic nou
        self.traffic += np.random.randint(0, 20, size=3)

        # Actualizează faza curentă
        self.current_phase = phase

        # Recompensa: câte mașini au trecut
        reward = passed

        # Nu se oprește niciodată episodul
        terminated = False
        truncated = False
        info = {}

        return self._get_obs(), reward, terminated, truncated, info
