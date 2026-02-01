#!/bin/bash

# Aggressive Pre-start Cleanup Script for gabo-mcp
# This script MUST run before starting the MCP server to prevent zombie processes
# Usage: ./scripts/pre-start.sh

set -e

echo "🔪 Pre-start cleanup for gabo-mcp..."

# Function to kill processes by pattern
kill_by_pattern() {
    local pattern="$1"
    local count=$(pgrep -f "$pattern" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count" -gt 0 ]; then
        echo "  Found $count process(es) matching: $pattern"
        pgrep -f "$pattern" | xargs kill -9 2>/dev/null || true
        sleep 1
        
        # Double-check
        local remaining=$(pgrep -f "$pattern" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$remaining" -gt 0 ]; then
            echo "  ⚠️  $remaining process(es) still running, forcing kill..."
            pgrep -f "$pattern" | xargs kill -9 2>/dev/null || true
        else
            echo "  ✅ Killed all: $pattern"
        fi
    fi
}

# Kill by specific patterns
echo "  Killing gabo-mcp-server processes..."
kill_by_pattern "gabo-mcp-server"

echo "  Killing tsx src/index.ts processes..."
kill_by_pattern "tsx src/index.ts"

echo "  Killing node tsx processes..."
kill_by_pattern "node.*tsx"

# Clean up temporary files
echo "🧹 Cleaning temporary files..."
rm -f /tmp/gabo-mcp-traffic.log 2>/dev/null || true
rm -rf /tmp/tsx-* 2>/dev/null || true
rm -rf /tmp/node-tsx-* 2>/dev/null || true

# Verify cleanup
final_count=$(pgrep -f "gabo-mcp|tsx.*index" 2>/dev/null | wc -l | tr -d ' ')
if [ "$final_count" -eq 0 ]; then
    echo "✅ Cleanup complete - no zombies remaining!"
    exit 0
else
    echo "⚠️  Warning: $final_count process(es) still detected but continuing..."
    pgrep -f "gabo-mcp|tsx.*index" | head -5
    exit 0  # Don't block startup
fi
