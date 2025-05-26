from stable_baselines3 import PPO
import gym
import gym_cityflow
import numpy as np
from gym import spaces
from gym.core import ObservationWrapper

class FlattenDictEnv(ObservationWrapper):
    """
    ObservationWrapper to flatten a Dict observation space of MultiDiscrete into a single vector.
    """
    def __init__(self, env):
        super().__init__(env)
        dict_space = env.observation_space
        assert isinstance(dict_space, spaces.Dict), "Expected Dict observation space"
        lows, highs = [], []
        # Process subspaces in sorted order for consistency
        for key in sorted(dict_space.spaces.keys()):
            space = dict_space.spaces[key]
            if isinstance(space, spaces.MultiDiscrete):
                nvec = space.nvec
                lows.extend([0] * len(nvec))
                highs.extend(nvec.tolist())
            else:
                raise NotImplementedError(f"Unsupported space type: {type(space)} for key {key}")
        # Define new flattened Box observation space
        self.observation_space = spaces.Box(
            low=np.array(lows, dtype=np.int64),
            high=np.array(highs, dtype=np.int64),
            dtype=np.int64
        )

    def observation(self, obs):
        flat = []
        for key in sorted(obs.keys()):
            flat.extend(obs[key])
        return np.array(flat, dtype=np.int64)

if __name__ == "__main__":
    # Create the CityFlow environment
    env = gym.make(
        'cityflow-v0',
        configPath='/workspace/CityFlow/config.json',
        episodeSteps=100
    )
    # Flatten Dict observation into vector
    env = FlattenDictEnv(env)

    # Initialize and train the PPO agent with an MLP policy
    model = PPO(
        "MlpPolicy",
        env,
        verbose=1
    )
    model.learn(total_timesteps=200000)

    # Save the trained model
    model.save("/workspace/CityFlow/models/ppo_cityflow")
