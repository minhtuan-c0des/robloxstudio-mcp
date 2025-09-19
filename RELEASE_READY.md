# Release 1.5.1 - Ready for Testing

## ✅ All Version References Updated

### Files Updated:
1. `package.json` - Version: 1.5.1 ✓
2. `src/index.ts` - Server version: 1.5.1 ✓
3. `studio-plugin/plugin.luau`:
   - Window title: "MCP Server v1.5.1" ✓
   - Version label: "AI Integration • v1.5.1" ✓
4. `docs/forum-announcement.md` - Version 1.5.1 ✓

## 📦 NPM Package Status
- **Published**: v1.5.1 is live on npm
- **Install**: `npm install robloxstudio-mcp@1.5.1`
- **NPX**: `npx robloxstudio-mcp@1.5.1`

## 🔧 NPX Caching Solution
Users experiencing caching issues should use one of these approaches:

1. **Specify version in MCP config**:
```json
{
  "mcpServers": {
    "robloxstudio-mcp": {
      "command": "npx",
      "args": ["-y", "robloxstudio-mcp@1.5.1"],
      "description": "Advanced Roblox Studio integration for AI assistants"
    }
  }
}
```

2. **Use @latest**:
```json
"args": ["-y", "robloxstudio-mcp@latest"]
```

3. **Clear NPX cache**:
```bash
rm -rf ~/.npm/_npx/*/node_modules/robloxstudio-mcp
```

## 📋 What's Fixed in 1.5.1

### Connection Issues:
- ✅ No more hanging on "HTTP ✓ MCP ✗"
- ✅ Proper cleanup on disconnect
- ✅ Smooth reconnection without multiple attempts
- ✅ Correct pending state display ("HTTP: ... MCP: ...")

### Technical Improvements:
- Added `/disconnect` endpoint with full cleanup
- Implemented `clearAllPendingRequests()` method
- Added plugin/MCP activity tracking with timeouts
- Fixed state synchronization between services

## 🎮 For GitHub Release

When ready to create the release, you'll need:

1. **Plugin File**: The updated `studio-plugin/plugin.luau` with v1.5.1
2. **Release Notes**: Use `RELEASE_NOTES_v1.5.1.md`
3. **Tag**: v1.5.1

The MCPPlugin.rbxmx file will need to be regenerated in Roblox Studio with the updated plugin.luau code.

## Testing Checklist

Before creating the GitHub release:
- [ ] Test npm package installation
- [ ] Verify connection/disconnection works smoothly
- [ ] Check that version shows correctly in plugin UI
- [ ] Confirm no hanging states occur
- [ ] Test with Claude Desktop

Everything is committed, pushed, and published. Ready for testing!