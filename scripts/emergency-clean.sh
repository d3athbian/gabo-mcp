#!/bin/bash

# Emergency Cleanup for gabo-mcp
# Use this when Continue.dev is not working or there are zombie processes
# Usage: npm run clean

echo "🧹 EMERGENCY CLEANUP - gabo-mcp"
echo "================================"
echo ""

# Function to show current processes
show_processes() {
    echo "📊 Current MCP processes:"
    ps aux | grep -E "(gabo-mcp|tsx.*index|node.*mcp)" | grep -v grep | grep -v $$ || echo "  (none found)"
    echo ""
}

# Show before
echo "🔍 BEFORE cleanup:"
show_processes

# Kill by name
echo "🔪 Killing processes..."

# Kill by exact process name
sudo -n pkill -9 -x "gabo-mcp-server" 2>/dev/null || pkill -9 -x "gabo-mcp-server" 2>/dev/null || echo "  - No gabo-mcp-server found"

# Kill by pattern
sudo -n pkill -9 -f "gabo-mcp" 2>/dev/null || pkill -9 -f "gabo-mcp" 2>/dev/null || echo "  - No gabo-mcp processes found"
sudo -n pkill -9 -f "tsx.*src/index.ts" 2>/dev/null || pkill -9 -f "tsx.*src/index.ts" 2>/dev/null || echo "  - No tsx processes found"
sudo -n pkill -9 -f "node.*tsx" 2>/dev/null || pkill -9 -f "node.*tsx" 2>/dev/null || echo "  - No node tsx found"

# Kill any node process in the gabo-mcp directory
ps aux | grep "gabo-mcp" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Wait
echo "⏳ Waiting 2 seconds..."
sleep 2

# Clean temp files
echo "🧹 Cleaning temp files..."
rm -f /tmp/gabo-mcp-traffic.log 2>/dev/null
rm -rf /tmp/tsx-* 2>/dev/null
rm -rf /tmp/node-tsx-* 2>/dev/null

# Show after
echo ""
echo "🔍 AFTER cleanup:"
show_processes

# Count remaining
remaining=$(ps aux | grep -E "(gabo-mcp|tsx.*index|node.*mcp)" | grep -v grep | grep -v $$ | wc -l | tr -d ' ')

if [ "$remaining" -eq 0 ]; then
    echo "✅ SUCCESS: All zombies eliminated!"
    echo ""
    echo "👉 You can now start the server with:"
    echo "   npm run dev:local"
    echo ""
    echo "👉 Or use in Continue.dev directly"
else
    echo "⚠️  WARNING: $remaining process(es) still running"
    echo "   Try manually: kill -9 <PID>"
    echo "   Or restart your terminal"
fi

echo ""
echo "================================"
