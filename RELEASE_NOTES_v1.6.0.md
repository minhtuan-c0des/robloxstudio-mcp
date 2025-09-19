# v1.6.0

Highlights
- ModuleScript support: Read and write ModuleScript.Source via LuaSourceContainer handling (Script, LocalScript, ModuleScript)
- Content search now includes ModuleScripts (search_files with searchType=content)
- set_property now supports setting Source on any LuaSourceContainer
- Added HTTP parity endpoints: /mcp/get_script_source and /mcp/set_script_source

Details
- Plugin updated to treat script-like instances using IsA("LuaSourceContainer")
  - File tree, project structure, and children listings mark hasSource for Script/LocalScript/ModuleScript
  - get_instance_properties includes Source for LuaSourceContainer; Enabled only for BaseScript
  - set_property handles Source for LuaSourceContainer
- Tools layer unchanged API shape; script tools continue to return MCP text content with JSON payloads
- HTTP bridge exposes new /mcp endpoints mirroring tool calls

Upgrade notes
- No breaking API changes
- Ensure Studio plugin is updated (plugin.luau shows v1.6.0 in UI)
- If using a pinned NPX version, update to:
  - npx -y robloxstudio-mcp@1.6.0

Thanks to the community for feedback on script tooling—ModuleScript support is now first-class.
