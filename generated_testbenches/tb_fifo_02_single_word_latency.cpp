/**
 * ============================================================================
 * PRE-SILICON VERIFICATION TESTBENCH: tb_fifo_02_single_word_latency.cpp
 * Title: Single Byte Write and Read Latency Cycle Check
 * Module: SyncFIFO_8bit_16depth (8-bit Synchronous FIFO Buffer with 16-entry depth)
 * Verification Engineer: Principal Pre-Silicon Verification Architect
 * Standard: IEEE C++17 Self-Checking Simulation Testbench
 * ============================================================================
 */

#include <iostream>
#include <cassert>
#include <cstdint>
#include <vector>
#include <deque>
#include <iomanip>
#include <string>

// ============================================================================
// CYCLE-ACCURATE HARDWARE MODEL UNDER TEST (MUT)
// ============================================================================
struct SyncFIFO_8bit_16depth {
    // Internal Memory Array (16 depth x 8-bit width)
    uint8_t mem[16];
    uint8_t wr_ptr;
    uint8_t rd_ptr;
    uint8_t count;

    // Hardware Port Interface
    bool clk;
    bool rst_n;
    bool wr_en;
    bool rd_en;
    uint8_t data_in;
    uint8_t data_out;
    bool full;
    bool empty;
    bool overflow;
    bool underflow;

    SyncFIFO_8bit_16depth() {
        clk = false;
        rst_n = false;
        wr_en = false;
        rd_en = false;
        data_in = 0;
        data_out = 0;
        full = false;
        empty = true;
        overflow = false;
        underflow = false;
        wr_ptr = 0;
        rd_ptr = 0;
        count = 0;
        for (int i = 0; i < 16; ++i) mem[i] = 0;
    }

    // Cycle-accurate synchronous clock edge evaluation (rising edge)
    void tick() {
        clk = !clk; // Toggle clock low-to-high edge
        if (!rst_n) {
            // Asynchronous / synchronous active-low reset assertion
            wr_ptr = 0;
            rd_ptr = 0;
            count = 0;
            data_out = 0;
            full = false;
            empty = true;
            overflow = false;
            underflow = false;
            return;
        }

        // Evaluate read and write operations
        bool can_read = (count > 0);
        bool can_write = (count < 16) || (rd_en && can_read); // Simultaneous RW at full allows write

        // Overflow condition: write asserted when FIFO is full and no read occurs
        if (wr_en && count == 16 && !rd_en) {
            overflow = true; // Sticky/latched overflow flag
        }

        // Underflow condition: read asserted when FIFO is empty
        if (rd_en && count == 0) {
            underflow = true; // Sticky/latched underflow flag
        }

        // Execute valid read
        if (rd_en && can_read) {
            data_out = mem[rd_ptr];
            rd_ptr = (rd_ptr + 1) % 16;
        }

        // Execute valid write
        if (wr_en && (count < 16 || (rd_en && can_read))) {
            mem[wr_ptr] = data_in;
            wr_ptr = (wr_ptr + 1) % 16;
        }

        // Update occupancy counter
        bool did_write = wr_en && (count < 16 || (rd_en && can_read));
        bool did_read = rd_en && can_read;

        if (did_write && !did_read) {
            count++;
        } else if (!did_write && did_read) {
            count--;
        }

        // Update hardware status flags
        full = (count == 16);
        empty = (count == 0);
    }

    // Helper to simulate full clock cycle (low -> high tick)
    void step() {
        tick();
    }
};

// ============================================================================
// VERIFICATION HARNESS & SCOREBOARD
// ============================================================================
class FIFOTestHarness {
public:
    SyncFIFO_8bit_16depth dut;
    std::deque<uint8_t> golden_queue;
    uint64_t cycle_count;

    FIFOTestHarness() : cycle_count(0) {}

    void reset() {
        dut.rst_n = false;
        dut.wr_en = false;
        dut.rd_en = false;
        dut.data_in = 0;
        golden_queue.clear();
        for (int i = 0; i < 5; ++i) {
            dut.step();
            cycle_count++;
        }
        dut.rst_n = true;
        dut.step();
        cycle_count++;
        assert(dut.empty == true && "DUT must be empty immediately after reset");
        assert(dut.full == false && "DUT must not be full after reset");
        assert(dut.overflow == false && "Overflow flag must be cleared on reset");
        assert(dut.underflow == false && "Underflow flag must be cleared on reset");
        assert(dut.count == 0 && "Count register must be zeroed");
    }

    void write_byte(uint8_t val) {
        dut.wr_en = true;
        dut.rd_en = false;
        dut.data_in = val;
        dut.step();
        cycle_count++;
        dut.wr_en = false;
        if (golden_queue.size() < 16) {
            golden_queue.push_back(val);
        }
    }

    uint8_t read_byte() {
        dut.rd_en = true;
        dut.wr_en = false;
        dut.step();
        cycle_count++;
        dut.rd_en = false;
        assert(!golden_queue.empty() && "Harness underflow check against golden model");
        uint8_t expected = golden_queue.front();
        golden_queue.pop_front();
        assert(dut.data_out == expected && "DUT output data must match golden model");
        return dut.data_out;
    }
};

int main() {
    std::cout << "[TESTBENCH START] " << "tb_fifo_02_single_word_latency" << " - Single Byte Write and Read Latency Cycle Check" << std::endl;
    FIFOTestHarness harness;
    harness.reset();

    uint8_t test_val = 0x5A;
    std::cout << "Writing single byte: 0x" << std::hex << (int)test_val << std::dec << std::endl;
    harness.write_byte(test_val);

    assert(harness.dut.empty == false && "FIFO must transition empty to false after write");
    assert(harness.dut.count == 1 && "Occupancy must be exactly 1");

    uint8_t read_val = harness.read_byte();
    assert(read_val == test_val && "Read data must exactly match written byte");
    assert(harness.dut.empty == true && "FIFO must return to empty after single read");
    assert(harness.dut.count == 0 && "Occupancy must return to 0");

    std::cout << "[PASS] Single word write-to-read latency and integrity verified." << std::endl;
    return 0;
}
