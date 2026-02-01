#!/bin/bash

# Process Management Script for gabo-mcp
# Run this before starting the MCP server to ensure clean state

echo "🧹 Checking for zombie processes..."

# Count existing processes
ZOMBIE_COUNT=$(ps aux | grep -E "gabo-mcp-server|tsx.*src/index.ts" | grep -v grep | grep -v $$ | wc -l)

if [ "$ZOMBIE_COUNT" -gt 0 ]; then
    echo "⚠️  Found $ZOMBIE_COUNT zombie process(es)"
    echo "🔪 Killing zombies..."
    
    # Kill by process title
    pkill -f "gabo-mcp-server" 2>/dev/null
    
    # Kill by pattern
    pkill -f "tsx src/index.ts" 2>/dev/null
    pkill -f "gabo-mcp" 2>/dev/null
    
    # Wait a moment
    sleep 1
    
    # Verify cleanup
    REMAINING=$(ps aux | grep -E "gabo-mcp-server|tsx.*src/index.ts" | grep -v grep | wc -l)
    
    if [ "$REMAINING" -eq 0 ]; then
        echo "✅ All zombies eliminated!"
    else
        echo "⚠️  $REMAINING process(es) still running (may need manual kill)"
        echo "📝 Run: ps aux | grep gabo-mcp"
    fi
else
    echo "✅ No zombies found - clean slate!"
fi

# Clean up temp files
echo "🧹 Cleaning temp files..."
rm -f /tmp/gabo-mcp-traffic.log 2>/dev/null
rm -rf /tmp/tsx-* 2>/dev/null

echo "✅ Cleanup complete!"
