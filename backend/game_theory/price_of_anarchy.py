import numpy as np


def compute_price_of_anarchy(nash_equilibria: list[dict], cooperative: dict) -> float:
    """Compute Price of Anarchy = cooperative welfare / worst Nash welfare."""
    if not nash_equilibria:
        return float('inf')

    worst_nash_welfare = min(eq["social_welfare"] for eq in nash_equilibria)

    if worst_nash_welfare <= 0:
        return float('inf')

    return cooperative["social_welfare"] / worst_nash_welfare
