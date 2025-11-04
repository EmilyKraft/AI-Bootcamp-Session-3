const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) db.close();
});

describe('Items API', () => {
  let itemId;

  it('should create a new item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ title: 'Test Item', description: 'A test item', due_date: '2025-09-30' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Item');
    expect(res.body.description).toBe('A test item');
    expect(res.body.due_date).toBe('2025-09-30');
    expect(res.body.completed).toBe(0);
    expect(res.body.priority).toBe('P3');
    itemId = res.body.id;
  });

  it('should get all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a single item by id', async () => {
    const res = await request(app).get(`/api/items/${itemId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(itemId);
  });

  it('should update an item', async () => {
    const res = await request(app)
      .put(`/api/items/${itemId}`)
      .send({ title: 'Updated Item', description: 'Updated', due_date: '2025-10-01', priority: 'P1' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Item');
    expect(res.body.description).toBe('Updated');
    expect(res.body.due_date).toBe('2025-10-01');
    expect(['P1','P2','P3']).toContain(res.body.priority);
  });

  it('should mark an item as completed', async () => {
    const res = await request(app)
      .patch(`/api/items/${itemId}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(1);
    expect(['P1','P2','P3']).toContain(res.body.priority);
  });

  it('should create item with explicit priority', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ title: 'Priority Item', description: 'With priority', priority: 'P2' });
    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('P2');
  });

  it('should fallback invalid priority to P3', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ title: 'Bad Priority Item', priority: 'INVALID' });
    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('P3');
  });

  it('should delete an item', async () => {
    const res = await request(app).delete(`/api/items/${itemId}`);
    expect(res.status).toBe(204);
  });
});
