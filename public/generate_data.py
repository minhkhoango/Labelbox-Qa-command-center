import csv
import numpy as np
from typing import List, Dict, Any

# --- CONFIGURATION PARAMETERS ---

# General Simulation Settings
TOTAL_WEEKS: int = 24
CORE_TEAM_MEMBERS: List[str] = ["Wang", "Sarah", "Michael", "Amir"]
NEW_HIRE_NAME: str = "Alex"
NEW_HIRE_START_WEEK: int = 9

# Onboarding Impact (The "Training Tax")
TRAINING_IMPACT_WEEKS: int = 4  # How many weeks the core team is affected
CORE_TEAM_THROUGHPUT_DIP: float = 0.20 # 20% drop in throughput at the start of training
CORE_TEAM_QUALITY_DIP_MULTIPLIER: float = 1.5 # Rework rate temporarily increases by 50%

# Annotator Drift Parameters (Performance degradation over time)
# Only quality drift - throughput has no drift over time (only affected by training tax)
CORE_DRIFT_REWORK_RATE_BASE: float = 0.0008  # 20x stronger - realistic 6-month drift
CORE_DRIFT_REWORK_RATE_EXPONENT: float = 1.2  # More gradual, realistic growth
CORE_DRIFT_IOU_BASE: float = 0.00020  # Reduced from 0.0008 to keep final IoU above 87%
CORE_DRIFT_IOU_EXPONENT: float = 1.8  # More gradual, realistic growth

ALEX_DRIFT_REWORK_RATE_BASE: float = 0.0012  # 1.5x stronger than core team
ALEX_DRIFT_REWORK_RATE_EXPONENT: float = 1.3  # Slightly faster drift for new hire
ALEX_DRIFT_IOU_BASE: float = 0.0003  # 1.5x stronger than core team (reduced proportionally)
ALEX_DRIFT_IOU_EXPONENT: float = 1.9  # Slightly faster drift for new hire

# Core Team Baseline Performance
CORE_THROUGHPUT_MEAN: float = 1075.0
CORE_THROUGHPUT_STD: float = 50.0
CORE_REWORK_RATE_MEAN: float = 0.02
CORE_REWORK_RATE_STD: float = 0.005
CORE_IOU_MEAN: float = 0.98
CORE_IOU_STD: float = 0.005
CORE_ALPHA_MEAN: float = 0.95
CORE_ALPHA_STD: float = 0.01

# Krippendorff's Alpha Drift Parameters
CORE_DRIFT_ALPHA_BASE: float = 0.00008  # 6.7x stronger - realistic 6-month drift
CORE_DRIFT_ALPHA_EXPONENT: float = 1.8  # Gradual, realistic growth
ALEX_DRIFT_ALPHA_BASE: float = 0.00012  # 1.5x stronger than core team
ALEX_DRIFT_ALPHA_EXPONENT: float = 1.9  # Slightly faster drift for new hire

# New Hire Performance Trajectory
ALEX_THROUGHPUT_START: float = 650.0
ALEX_THROUGHPUT_END: float = 950.0
ALEX_REWORK_RATE_START: float = 0.18
ALEX_REWORK_RATE_END: float = 0.12  # Less dramatic improvement - more realistic
ALEX_IOU_START: float = 0.88
ALEX_IOU_END: float = 0.95
ALEX_ALPHA_START: float = 0.75 # <-- ADD THIS
ALEX_ALPHA_END: float = 0.90   # <-- ADD THIS

# Output Filenames
INDIVIDUAL_FILENAME: str = "public/individual_performance.csv"
TEAM_FILENAME: str = "public/team_performance.csv"


def generate_individual_performance() -> List[Dict[str, Any]]:
    """
    Simulates weekly performance for every individual, including the "training tax" dip.
    This is the ground-truth data from which everything else is derived.

    Returns:
        A flat list of dictionaries, where each dictionary is a record of one
        person's performance for one week.
    """
    all_performance_records: List[Dict[str, Any]] = []

    # 1. Simulate for the core team
    for member in CORE_TEAM_MEMBERS:
        for week in range(1, TOTAL_WEEKS + 1):
            # Start with baseline performance
            throughput = np.random.normal(CORE_THROUGHPUT_MEAN, CORE_THROUGHPUT_STD)
            rework_rate = np.random.normal(CORE_REWORK_RATE_MEAN, CORE_REWORK_RATE_STD)
            mean_iou = np.random.normal(CORE_IOU_MEAN, CORE_IOU_STD)
            kripp_alpha = float(np.random.normal(CORE_ALPHA_MEAN, CORE_ALPHA_STD))

            # Check if this week is affected by the "training tax"
            if NEW_HIRE_START_WEEK <= week < NEW_HIRE_START_WEEK + TRAINING_IMPACT_WEEKS:
                # Calculate how far into the training period we are
                progress = (week - NEW_HIRE_START_WEEK) / TRAINING_IMPACT_WEEKS
                
                # The dip is strongest at the start and recovers linearly
                throughput_dip_multiplier = CORE_TEAM_THROUGHPUT_DIP * (1 - progress)
                quality_dip_multiplier = (CORE_TEAM_QUALITY_DIP_MULTIPLIER - 1.0) * (1 - progress)

                # Apply the penalty
                throughput *= (1 - throughput_dip_multiplier)
                rework_rate *= (1 + quality_dip_multiplier)
                mean_iou *= (1 - (throughput_dip_multiplier / 4)) # Smaller impact on IoU
                kripp_alpha *= (1 - (throughput_dip_multiplier / 3)) # <-- ADD THIS (Slightly larger dip than IoU)

            # Apply quality drift over time (no throughput drift)
            drift_rework_rate_increase = CORE_DRIFT_REWORK_RATE_BASE * (week ** CORE_DRIFT_REWORK_RATE_EXPONENT)
            drift_iou_decrease = CORE_DRIFT_IOU_BASE * (week ** CORE_DRIFT_IOU_EXPONENT)
            drift_alpha_decrease = CORE_DRIFT_ALPHA_BASE * (week ** CORE_DRIFT_ALPHA_EXPONENT)

            # Apply cumulative drift effects (only quality degrades over time, throughput remains constant)
            rework_rate = max(0.0, rework_rate + drift_rework_rate_increase)
            mean_iou = max(0.0, min(1.0, mean_iou * (1 - drift_iou_decrease)))
            kripp_alpha = max(0.0, min(1.0, kripp_alpha * (1.0 - drift_alpha_decrease)))
            # Throughput has no drift - only affected by training tax
            throughput = max(0, int(round(throughput)))

            all_performance_records.append({
                "Week": week,
                "Member": member,
                "Throughput": int(round(throughput)),
                "Rework Rate": max(0.0, rework_rate),
                "Mean IoU": max(0.0, min(1.0, mean_iou)),
                "Krippendorff's Alpha": max(0.0, min(1.0, kripp_alpha)) # <-- ADD THIS
            })

    # 2. Simulate for the new hire, Alex
    total_weeks_for_alex = TOTAL_WEEKS - NEW_HIRE_START_WEEK + 1
    throughput_gain = (ALEX_THROUGHPUT_END - ALEX_THROUGHPUT_START) / total_weeks_for_alex
    rework_improvement = (ALEX_REWORK_RATE_START - ALEX_REWORK_RATE_END) / total_weeks_for_alex
    iou_improvement = (ALEX_IOU_END - ALEX_IOU_START) / total_weeks_for_alex
    alpha_improvement = (ALEX_ALPHA_END - ALEX_ALPHA_START) / total_weeks_for_alex # <-- ADD THIS

    for week in range(NEW_HIRE_START_WEEK, TOTAL_WEEKS + 1):
        current_week_idx = week - NEW_HIRE_START_WEEK
        base_throughput = ALEX_THROUGHPUT_START + (throughput_gain * current_week_idx)
        base_rework = ALEX_REWORK_RATE_START - (rework_improvement * current_week_idx)
        base_iou = ALEX_IOU_START + (iou_improvement * current_week_idx)
        base_alpha = ALEX_ALPHA_START + (alpha_improvement * current_week_idx) # <-- ADD THIS


        # Apply quality drift over time for Alex (no throughput drift)
        drift_rework_rate_increase = ALEX_DRIFT_REWORK_RATE_BASE * (week ** ALEX_DRIFT_REWORK_RATE_EXPONENT)
        drift_iou_decrease = ALEX_DRIFT_IOU_BASE * (week ** ALEX_DRIFT_IOU_EXPONENT)
        drift_alpha_decrease = ALEX_DRIFT_ALPHA_BASE * (week ** ALEX_DRIFT_ALPHA_EXPONENT)

        # Apply cumulative drift effects (Alex experiences stronger quality degradation)
        base_rework += drift_rework_rate_increase
        base_iou *= (1 - drift_iou_decrease)
        base_alpha *= (1 - drift_alpha_decrease)
        # base_throughput remains unchanged - no drift

        # Generate random values
        throughput_val = float(np.random.normal(base_throughput, CORE_THROUGHPUT_STD))
        rework_val = float(np.random.normal(base_rework, CORE_REWORK_RATE_STD * 1.5)) # type: ignore
        iou_val = float(np.random.normal(base_iou, CORE_IOU_STD * 1.5)) # type: ignore
        alpha_val =  float(np.random.normal(base_alpha, CORE_ALPHA_STD * 1.5)) # type: ignore
        
        all_performance_records.append({
            "Week": week,
            "Member": NEW_HIRE_NAME,
            "Throughput": int(round(throughput_val)),
            "Rework Rate": max(0.0, rework_val),
            "Mean IoU": max(0.0, min(1.0, iou_val)),
            "Krippendorff's Alpha": max(0.0, min(1.0, alpha_val)) # <-- ADD THIS
        })
        
    return all_performance_records

def write_individual_performance_csv(data: List[Dict[str, Any]], filename: str) -> None:
    """Writes the detailed individual performance data to a CSV file."""
    print(f"Writing individual performance data to {filename}...")
    
    # Sort data for readability
    data.sort(key=lambda x: (x['Week'], x['Member']))
    
    # Add calculated field
    for row in data:
        row["Reworked Annotations"] = int(round(row["Throughput"] * row["Rework Rate"]))

    try:
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ["Week", "Member", "Throughput", "Reworked Annotations", "Rework Rate", "Mean IoU", "Krippendorff's Alpha"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            # Write data, formatting for clarity
            for row in data:
                alpha_key = "Krippendorff's Alpha"
                formatted_row = {
                    "Week": row["Week"],
                    "Member": row["Member"],
                    "Throughput": row["Throughput"],
                    "Reworked Annotations": row["Reworked Annotations"],
                    "Rework Rate": f"{row['Rework Rate']:.4f}",
                    "Mean IoU": f"{row['Mean IoU']:.4f}",
                    "Krippendorff's Alpha": f"{row[alpha_key]:.4f}"
                }
                writer.writerow(formatted_row)
        print("Successfully generated individual performance CSV.")
    except IOError as e:
        print(f"Error writing to file: {e}")

def aggregate_and_write_team_performance_csv(individual_data: List[Dict[str, Any]], filename: str) -> None:
    """Aggregates individual data to the team level and writes it to a CSV."""
    print(f"Aggregating and writing team performance data to {filename}...")
    team_results: List[Dict[str, Any]] = []
    cumulative_annotations: int = 0

    for week in range(1, TOTAL_WEEKS + 1):
        weekly_data = [row for row in individual_data if row["Week"] == week]
        
        if not weekly_data:
            continue

        total_weekly_throughput = sum(row["Throughput"] for row in weekly_data)
        total_reworked_annotations = sum(row["Reworked Annotations"] for row in weekly_data)

        # Calculate weighted average rework rate for the team
        overall_rework_rate = (total_reworked_annotations / total_weekly_throughput) if total_weekly_throughput > 0 else 0.0
        
        # Calculate weighted average Krippendorff's Alpha for the team (weighted by throughput)
        alpha_key = "Krippendorff's Alpha"
        weighted_alpha_sum = sum(row[alpha_key] * row["Throughput"] for row in weekly_data)
        overall_alpha = weighted_alpha_sum / total_weekly_throughput if total_weekly_throughput > 0 else 0.0
        
        # Calculate weighted average Mean IoU for the team (weighted by throughput)
        weighted_iou_sum = sum(row["Mean IoU"] * row["Throughput"] for row in weekly_data)
        overall_iou = weighted_iou_sum / total_weekly_throughput if total_weekly_throughput > 0 else 0.0
        
        cumulative_annotations += total_weekly_throughput
        
        team_results.append({
            "Week": week,
            "Weekly Throughput": total_weekly_throughput,
            "Rework Rate (%)": round(overall_rework_rate * 100, 2),
            "Krippendorff's Alpha": round(overall_alpha, 4),
            "Mean IoU": round(overall_iou, 4),
            "Cumulative Annotations": cumulative_annotations
        })

    try:
        with open(filename, 'w', newline='') as csvfile:
            fieldnames = ["Week", "Weekly Throughput", "Rework Rate (%)", "Krippendorff's Alpha", "Mean IoU", "Cumulative Annotations"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(team_results)
        print("Successfully generated team performance CSV.")
    except IOError as e:
        print(f"Error writing to file: {e}")

def print_drift_summary() -> None:
    """Prints a summary of the annotator drift effects over the simulation period."""
    print("\n" + "="*60)
    print("ANNOTATOR DRIFT IMPACT SUMMARY")
    print("="*60)
    
    # Core team drift over 24 weeks
    core_final_rework_drift = CORE_DRIFT_REWORK_RATE_BASE * (TOTAL_WEEKS ** CORE_DRIFT_REWORK_RATE_EXPONENT)
    core_final_iou_drift = CORE_DRIFT_IOU_BASE * (TOTAL_WEEKS ** CORE_DRIFT_IOU_EXPONENT)
    core_final_alpha_drift = CORE_DRIFT_ALPHA_BASE * (TOTAL_WEEKS ** CORE_DRIFT_ALPHA_EXPONENT)
    
    # Alex drift over their 16 weeks (weeks 9-24)
    alex_weeks = TOTAL_WEEKS - NEW_HIRE_START_WEEK + 1
    alex_final_rework_drift = ALEX_DRIFT_REWORK_RATE_BASE * (TOTAL_WEEKS ** ALEX_DRIFT_REWORK_RATE_EXPONENT)
    alex_final_iou_drift = ALEX_DRIFT_IOU_BASE * (TOTAL_WEEKS ** ALEX_DRIFT_IOU_EXPONENT)
    alex_final_alpha_drift = ALEX_DRIFT_ALPHA_BASE * (TOTAL_WEEKS ** ALEX_DRIFT_ALPHA_EXPONENT)
    
    print(f"Core Team ({TOTAL_WEEKS} weeks): Rework +{core_final_rework_drift:.3f}, IoU -{core_final_iou_drift:.3f}, Alpha -{core_final_alpha_drift:.3f}")
    print(f"Alex ({alex_weeks} weeks): Rework +{alex_final_rework_drift:.3f}, IoU -{alex_final_iou_drift:.3f}, Alpha -{alex_final_alpha_drift:.3f}")
    print(f"Alex drift: {ALEX_DRIFT_REWORK_RATE_BASE/CORE_DRIFT_REWORK_RATE_BASE:.0f}x stronger than core team")
    print("="*60)


if __name__ == "__main__":
    # Set a fixed random seed for reproducible results
    np.random.seed(42)
    
    # Main execution block
    individual_data = generate_individual_performance()
    
    # Create the two required CSV files from the single source of truth
    write_individual_performance_csv(individual_data, INDIVIDUAL_FILENAME)
    aggregate_and_write_team_performance_csv(individual_data, TEAM_FILENAME)
    print_drift_summary()
