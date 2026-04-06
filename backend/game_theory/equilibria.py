import numpy as np
from itertools import product


def compute_payoff_matrix(game: dict, n_strategies: int = 3) -> np.ndarray:
    """Build a payoff matrix for the stakeholder game.

    Uses a simplified model: each player chooses a demand level (low/medium/high).
    Payoffs depend on total demand vs available resource.
    """
    n_players = len(game["players"])
    strategies = np.linspace(0.3, 1.0, n_strategies)  # fraction of max demand

    shape = tuple([n_strategies] * n_players + [n_players])
    payoff_matrix = np.zeros(shape)

    for idx in product(range(n_strategies), repeat=n_players):
        demands = np.array([strategies[i] for i in idx])
        total_demand = np.sum(demands)

        # Resource scarcity factor
        scarcity = min(1.0, 1.0 / max(total_demand, 0.01))

        # Each player's payoff: their demand * scarcity - cost of overuse
        for p in range(n_players):
            fulfilled = demands[p] * scarcity
            overuse_penalty = max(0, total_demand - 1.0) * 0.3 * demands[p] / max(total_demand, 0.01)
            payoff_matrix[idx + (p,)] = fulfilled - overuse_penalty

    return payoff_matrix


def find_nash_equilibria(payoff_matrix: np.ndarray) -> list[dict]:
    """Find pure strategy Nash equilibria via best-response iteration."""
    n_players = payoff_matrix.ndim - 1
    n_strategies = payoff_matrix.shape[0]
    equilibria = []

    for idx in product(range(n_strategies), repeat=n_players):
        is_nash = True
        for p in range(n_players):
            current_payoff = payoff_matrix[idx + (p,)]
            for alt_s in range(n_strategies):
                alt_idx = list(idx)
                alt_idx[p] = alt_s
                alt_payoff = payoff_matrix[tuple(alt_idx) + (p,)]
                if alt_payoff > current_payoff + 1e-10:
                    is_nash = False
                    break
            if not is_nash:
                break

        if is_nash:
            payoffs = [float(payoff_matrix[idx + (p,)]) for p in range(n_players)]
            equilibria.append({
                "strategies": list(idx),
                "payoffs": payoffs,
                "social_welfare": sum(payoffs)
            })

    return equilibria


def find_cooperative_solution(payoff_matrix: np.ndarray) -> dict:
    """Find the strategy profile that maximizes total social welfare."""
    n_players = payoff_matrix.ndim - 1
    n_strategies = payoff_matrix.shape[0]

    best_welfare = -np.inf
    best_idx = None

    for idx in product(range(n_strategies), repeat=n_players):
        welfare = sum(payoff_matrix[idx + (p,)] for p in range(n_players))
        if welfare > best_welfare:
            best_welfare = welfare
            best_idx = idx

    payoffs = [float(payoff_matrix[best_idx + (p,)]) for p in range(n_players)]
    return {
        "strategies": list(best_idx),
        "payoffs": payoffs,
        "social_welfare": float(best_welfare)
    }
