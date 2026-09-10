# Autonomous Pre-Silicon Hardware Testbench Generation & Verification Pipeline

An automated pre-silicon hardware verification framework built with Node.js that leverages the Gemini API (`@google/genai`) to generate, compile, execute, and store 20 unique C++17 self-checking testbenches for an 8-bit synchronous FIFO buffer (`SyncFIFO_8bit_16depth`).

---

## Features

* **Autonomous Generation Loop:** Dynamically generates 20 comprehensive verification testbenches covering scenarios from power-on reset to constrained-randomized stress testing.
* **Cycle-Accurate Simulation:** Implements digital state modeling and golden reference scoreboards (`std::deque`) to validate cycle-by-cycle behavior.
* **OS-Level Compilation & Execution:** Automatically invokes local `g++` (`-std=c++17`) to compile code, run binaries, and verify that all C++ `assert(...)` statements pass successfully.
* **Robust Cloud-to-Local Fallback:** Attempts to upload verified testbenches to Google Drive via service account credentials, automatically falling back to a local `verified_output/` folder if zero-quota storage restrictions are encountered.

---

## Project Directory Structure

```text
testbench-generator/
├── node_modules/
├── verified_output/         # Local fallback directory for verified C++ files
├── .env                     # Local environment credentials
├── index.js                 # Main automation pipeline script
├── package.json             # Project dependencies and metadata
└── service-account.json     # Google Drive API service account key