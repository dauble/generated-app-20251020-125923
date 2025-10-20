import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Driver, DriverStats, Constructor } from "@shared/types";
// Helper to fetch from OpenF1 API with error handling
async function fetchOpenF1(path: string) {
  const response = await fetch(`https://api.openf1.org/v1/${path}`);
  if (!response.ok) {
    console.error(`OpenF1 API request failed for ${path}:`, response.status, response.statusText);
    throw new Error(`Failed to fetch data from OpenF1 API for path: ${path}`);
  }
  return response.json();
}
// Static pricing data as it's not in the API (in millions), updated to be more realistic
const driverPrices: Record<string, number> = {
  'Max Verstappen': 30.5, 'Lando Norris': 24.0, 'Charles Leclerc': 23.5, 'Oscar Piastri': 20.0,
  'Carlos Sainz': 21.0, 'Sergio Pérez': 19.5, 'George Russell': 19.0, 'Lewis Hamilton': 18.5,
  'Fernando Alonso': 15.0, 'Yuki Tsunoda': 10.0, 'Lance Stroll': 12.5, 'Daniel Ricciardo': 9.5,
  'Nico Hülkenberg': 8.5, 'Kevin Magnussen': 8.0, 'Alexander Albon': 7.5, 'Pierre Gasly': 11.0,
  'Esteban Ocon': 11.5, 'Zhou Guanyu': 6.5, 'Valtteri Bottas': 7.0, 'Logan Sargeant': 6.0,
};
const constructorPrices: Record<string, number> = {
  'Red Bull Racing': 31.0, 'Ferrari': 27.0, 'McLaren': 25.0, 'Mercedes': 24.0,
  'Aston Martin Aramco': 16.0, 'Alpine': 13.0, 'Visa Cash App RB': 11.0, 'Kick Sauber': 7.0,
  'Williams': 8.0, 'Haas F1 Team': 8.5,
};
const constructorLogoUrls: Record<string, string> = {
    'Red Bull Racing': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/red%20bull.png',
    'Ferrari': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/ferrari.png',
    'McLaren': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/mclaren.png',
    'Mercedes': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/mercedes.png',
    'Aston Martin Aramco': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/aston%20martin.png',
    'Alpine': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/alpine.png',
    'Visa Cash App RB': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/RB.png',
    'Kick Sauber': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/sauber.png',
    'Williams': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/williams.png',
    'Haas F1 Team': 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1320,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/team%20logos/haas.png',
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // ApexDraft Routes
  app.get('/api/drivers', async (c) => {
    try {
      const sessionKey = 'latest';
      const [driversData, positionData] = await Promise.all([
        fetchOpenF1(`drivers?session_key=${sessionKey}`) as Promise<any[]>,
        fetchOpenF1(`position?session_key=${sessionKey}`) as Promise<any[]>
      ]);
      const pointsMap = new Map<number, number>();
      for (const pos of positionData) {
        if (pos.driver_number && typeof pos.points === 'number') {
          pointsMap.set(pos.driver_number, pos.points);
        }
      }
      const drivers: Driver[] = driversData.map(driver => ({
        id: driver.driver_number,
        name: driver.full_name,
        teamName: driver.team_name,
        teamColour: driver.team_colour,
        number: driver.driver_number,
        headshotUrl: driver.headshot_url,
        countryCode: driver.country_code,
        points: pointsMap.get(driver.driver_number) ?? null,
        price: driverPrices[driver.full_name] ?? 5.0,
      }));
      return ok(c, drivers);
    } catch (error) {
      console.error('Error in /api/drivers:', error);
      return bad(c, error instanceof Error ? error.message : 'An internal error occurred');
    }
  });
  app.get('/api/constructors', async (c) => {
    try {
      const teamsData = await fetchOpenF1('teams?session_key=latest') as any[];
      const constructors: Constructor[] = teamsData.map(team => ({
        id: team.team_number,
        name: team.team_name,
        price: constructorPrices[team.team_name] ?? 5.0,
        teamColour: team.team_colour,
        logoUrl: constructorLogoUrls[team.team_name] ?? null,
      }));
      return ok(c, constructors);
    } catch (error) {
      console.error('Error in /api/constructors:', error);
      return bad(c, error instanceof Error ? error.message : 'An internal error occurred');
    }
  });
  app.get('/api/drivers/:driverId/stats', async (c) => {
    const driverId = c.req.param('driverId');
    try {
      const sessionKey = 'latest';
      const positionData = await fetchOpenF1(`position?session_key=${sessionKey}&driver_number=${driverId}`) as any[];
      const latestPosition = positionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const lapsData = await fetchOpenF1(`laps?session_key=${sessionKey}&driver_number=${driverId}`) as any[];
      const fastestLap = lapsData.filter(l => l.lap_duration).sort((a, b) => a.lap_duration - b.lap_duration)[0];
      const points = latestPosition ? latestPosition.points : null;
      const stats: DriverStats = {
        driverNumber: parseInt(driverId, 10),
        position: latestPosition ? latestPosition.position : null,
        points: points,
        fastestLapRank: fastestLap ? fastestLap.rank_position : null,
        fastestLapTime: fastestLap ? (() => {
          const duration = fastestLap.lap_duration;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);
          const milliseconds = Math.round((duration * 1000) % 1000);
          return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
        })() : null,
        lapsCompleted: lapsData.length > 0 ? Math.max(...lapsData.map(l => l.lap_number)) : 0,
      };
      return ok(c, stats);
    } catch (error) {
      console.error(`Error in /api/drivers/${driverId}/stats:`, error);
      return bad(c, error instanceof Error ? error.message : 'An internal error occurred');
    }
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
}