# Labelbox Quality Monitor

A comprehensive dashboard for monitoring, diagnosing, and improving data annotation quality within Labelbox projects.

This tool provides a centralized command center to track key quality metrics over time, identify sources of annotator drift, and uncover consensus failures, enabling teams to build higher-quality training data with greater efficiency and control.

## Quick Start

Get the quality monitor running on your local machine in three steps.

**1. Install Dependencies**

Ensure you have Node.js and npm installed, then install the project dependencies.

```bash
npm install
```

**2. Run the Development Server**

Start the Next.js development server to view the dashboard.

```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser to access the Quality Monitor.

## Features

* **Project Health Overview:** Monitor high-level metrics like throughput, rework rate, Mean IoU, and Krippendorff's Alpha across the project lifecycle.
* **Individual Performance Analysis:** Drill down into the performance of individual annotators to diagnose issues with precision, quality, and agreement.
* **Consensus Diagnostics:** Use the "Evidence Locker" to visually inspect the specific data rows causing team-wide disagreement and concept drift.

## Contribution

This project is currently in a demo stage. For bug reports or feature suggestions, please open an issue in this repository. Ensure titles are technical and precise (e.g., "Bug: IoU chart fails to render with null values").
