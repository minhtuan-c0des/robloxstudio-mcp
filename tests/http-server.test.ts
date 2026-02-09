import request from 'supertest';
import { createHttpServer } from '../src/http-server.js';
import { BridgeService } from '../src/bridge-service.js';

// Minimal mock for RobloxStudioTools — we only need the http server behavior
const mockTools = {} as any;

describe('HTTP Server - MCP connection state', () => {
  let bridge: BridgeService;
  let app: any;

  beforeEach(() => {
    bridge = new BridgeService();
    app = createHttpServer(mockTools, bridge);
  });

  describe('poll endpoint without MCP client', () => {
    it('should return mcpConnected: false when no MCP client has connected', async () => {
      // Plugin polls before any MCP client has ever connected
      const res = await request(app).get('/poll');

      expect(res.status).toBe(503);
      expect(res.body.mcpConnected).toBe(false);
    });

    it('should not get stuck reporting mcpConnected: true from polling alone', async () => {
      // Simulate the plugin polling repeatedly — this should NOT make isMCPServerActive() true
      await request(app).get('/poll');
      await request(app).get('/poll');
      await request(app).get('/poll');

      const res = await request(app).get('/poll');

      expect(res.status).toBe(503);
      expect(res.body.mcpConnected).toBe(false);
    });
  });

  describe('poll endpoint with active MCP client', () => {
    beforeEach(() => {
      // Simulate MCP server being activated (happens in index.ts after stdio transport connects)
      (app as any).setMCPServerActive(true);
    });

    it('should return mcpConnected: true when MCP is active', async () => {
      const res = await request(app).get('/poll');

      expect(res.status).toBe(200);
      expect(res.body.mcpConnected).toBe(true);
      expect(res.body.pluginConnected).toBe(true);
    });

    it('should return no request when bridge queue is empty', async () => {
      const res = await request(app).get('/poll');

      expect(res.status).toBe(200);
      expect(res.body.request).toBeNull();
    });
  });

  describe('MCP activity timeout', () => {
    it('should report mcpConnected: false after MCP activity times out', async () => {
      // Activate MCP, then simulate staleness by backdating lastMCPActivity
      (app as any).setMCPServerActive(true);

      // Verify it's active first
      let res = await request(app).get('/poll');
      expect(res.status).toBe(200);
      expect(res.body.mcpConnected).toBe(true);

      // Force MCP activity to look stale (>15s old) by calling setMCPServerActive(false)
      (app as any).setMCPServerActive(false);

      // Now plugin polls should see MCP as disconnected
      res = await request(app).get('/poll');
      expect(res.status).toBe(503);
      expect(res.body.mcpConnected).toBe(false);
    });

    it('should recover when MCP tool call refreshes activity', async () => {
      (app as any).setMCPServerActive(true);
      // Deactivate to simulate timeout
      (app as any).setMCPServerActive(false);

      let res = await request(app).get('/poll');
      expect(res.status).toBe(503);

      // Re-activate (simulates a new MCP client connecting)
      (app as any).setMCPServerActive(true);

      res = await request(app).get('/poll');
      expect(res.status).toBe(200);
      expect(res.body.mcpConnected).toBe(true);
    });
  });

  describe('plugin connection tracking', () => {
    it('should mark plugin as connected when it polls', async () => {
      const healthBefore = await request(app).get('/health');
      expect(healthBefore.body.pluginConnected).toBe(false);

      await request(app).get('/poll');

      const healthAfter = await request(app).get('/health');
      expect(healthAfter.body.pluginConnected).toBe(true);
    });

    it('should clear pending requests on disconnect', async () => {
      (app as any).setMCPServerActive(true);
      await request(app).post('/ready');

      // Send a request through the bridge (will be pending)
      const bridgePromise = bridge.sendRequest('/api/test', {}).catch(() => {});

      // Disconnect should clear it
      await request(app).post('/disconnect');

      // The bridge promise should have been rejected
      await expect(bridgePromise).resolves.toBeUndefined();
    });
  });

  describe('MCP tool endpoints track activity', () => {
    it('should refresh MCP activity timestamp on tool endpoint calls', async () => {
      (app as any).setMCPServerActive(true);

      // Hit an MCP endpoint (will fail since mockTools has no methods, but middleware still runs)
      await request(app).post('/mcp/get_place_info').send({});

      // Poll should still see MCP as active
      const res = await request(app).get('/poll');
      expect(res.status).toBe(200);
      expect(res.body.mcpConnected).toBe(true);
    });
  });
});
