def suggest_mechanisms(game: dict, archetype: str) -> list[dict]:
    """Suggest incentive-compatible mechanisms based on archetype and game structure."""
    mechanisms = []

    if archetype in ["social_dilemma", "myopic_nash"]:
        mechanisms.append({
            "name": "Pigouvian Tax / Subsidy",
            "description": "Tax the negative externality and rebate the revenue to stakeholders. Internalizes the delayed cost into the immediate decision.",
            "implementation": "Add a penalty term to the cDSP objective proportional to the externality variable.",
            "formal_property": "Achieves first-best allocation when tax equals marginal external cost."
        })
        mechanisms.append({
            "name": "Quantity Cap (Command-and-Control)",
            "description": "Hard cap on resource extraction/use. Restricts the action space to eliminate the myopic Nash equilibrium.",
            "implementation": "Add an upper-bound constraint on the decision variable in the cDSP.",
            "formal_property": "Equivalent to Weitzman (1974) quantity instrument. Optimal under cost uncertainty."
        })

    if archetype == "social_dilemma":
        mechanisms.append({
            "name": "VCG Mechanism (Vickrey-Clarke-Groves)",
            "description": "Each stakeholder reports their value for resource allocation. The mechanism allocates efficiently and charges each stakeholder their externality cost.",
            "implementation": "Modify cDSP to include reported valuations. Each stakeholder pays the difference between others' welfare with and without their participation.",
            "formal_property": "Incentive-compatible, individually rational, efficient."
        })
        mechanisms.append({
            "name": "Ostrom's Design Principles",
            "description": "Community-based governance: clearly defined boundaries, proportional costs/benefits, collective choice, monitoring, graduated sanctions, conflict resolution.",
            "implementation": "Translate each principle into a constraint or governance rule in the cDSP.",
            "formal_property": "Empirically validated for common-pool resource management."
        })

    if archetype == "arms_race":
        mechanisms.append({
            "name": "Commitment Device",
            "description": "Both parties pre-commit to de-escalation thresholds via mutual constraints in the cDSP.",
            "implementation": "Add coupled constraints: if A's action exceeds threshold, B's constraint relaxes, creating a credible threat.",
            "formal_property": "Subgame-perfect equilibrium under credible commitment."
        })

    if archetype in ["competitive_exclusion"]:
        mechanisms.append({
            "name": "Rebalancing Mechanism",
            "description": "Periodic redistribution of resources to prevent runaway advantage accumulation.",
            "implementation": "Add a fairness constraint: no agent's allocation exceeds X% of total.",
            "formal_property": "Maintains competitive balance at cost of some efficiency."
        })

    if archetype in ["commitment_problem", "ratchet_effect", "reference_point_shift"]:
        mechanisms.append({
            "name": "Aspiration Anchoring",
            "description": "Lock in performance goals to prevent downward drift under pressure.",
            "implementation": "Add a floor constraint on goal variables in the cDSP.",
            "formal_property": "Prevents goal erosion at cost of potentially infeasible constraints."
        })

    if archetype == "coordination_failure":
        mechanisms.append({
            "name": "Joint Optimization Protocol",
            "description": "Replace individual optimization with a joint objective that maximizes mutual benefit.",
            "implementation": "Merge stakeholder objectives into a single weighted sum in the cDSP.",
            "formal_property": "Pareto-optimal by construction."
        })

    if archetype == "investment_timing":
        mechanisms.append({
            "name": "Proactive Investment Trigger",
            "description": "Invest before performance degrades by setting a capacity utilization threshold.",
            "implementation": "Add a constraint: if utilization > X%, trigger investment decision variable.",
            "formal_property": "Real-options-based investment timing."
        })

    # Default mechanism for all archetypes
    mechanisms.append({
        "name": "Context-Aware Policy (cDSP)",
        "description": "The cDSP formulation itself is a mechanism: it coordinates stakeholder allocations to approach the cooperative solution.",
        "implementation": "The full cDSP with weighted goal programming.",
        "formal_property": "Approximates cooperative solution via centralized optimization with stakeholder weights."
    })

    return mechanisms
