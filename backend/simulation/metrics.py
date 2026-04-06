import numpy as np


def compute_metrics(decisions: list[dict], states: list[dict], cdsp: dict) -> dict:
    """Compute aggregate simulation metrics."""
    shortfalls = []
    for d in decisions:
        day_shortfall = sum(v for k, v in d.items() if "d_minus" in k)
        shortfalls.append(day_shortfall)

    overachievements = []
    for d in decisions:
        day_over = sum(v for k, v in d.items() if "d_plus" in k)
        overachievements.append(day_over)

    # Extract state trajectories
    state_trajectories = {}
    if states:
        for key in states[0]:
            state_trajectories[key] = [s.get(key, 0) for s in states]

    metrics = {
        "total_shortfall": float(sum(shortfalls)),
        "shortfall_variance": float(np.var(shortfalls)) if shortfalls else 0.0,
        "mean_daily_shortfall": float(np.mean(shortfalls)) if shortfalls else 0.0,
        "max_daily_shortfall": float(max(shortfalls)) if shortfalls else 0.0,
        "total_overachievement": float(sum(overachievements)),
        "final_state": states[-1] if states else {},
        "state_trajectories": state_trajectories,
        "days_simulated": len(decisions),
    }

    # Fairness metrics (Gini coefficient of shortfalls across stakeholders)
    if shortfalls and len(shortfalls) > 1:
        sorted_s = sorted(shortfalls)
        n = len(sorted_s)
        cumulative = np.cumsum(sorted_s)
        total = cumulative[-1]
        if total > 0:
            gini = (2 * sum((i + 1) * s for i, s in enumerate(sorted_s)) - (n + 1) * total) / (n * total)
            metrics["shortfall_gini"] = float(gini)
        else:
            metrics["shortfall_gini"] = 0.0

    return metrics
