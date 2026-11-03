const request = require('supertest');
const app = require('../src/app');

describe('EduTrack Pro Backend API Suite', () => {
  let adminToken;
  let facultyToken;
  let studentToken;

  it('GET /api/health should return 200 ONLINE', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ONLINE');
  });

  it('POST /api/auth/login should authenticate Admin with bcrypt and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@edutrack.edu', password: 'Admin@123' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  it('POST /api/auth/login should authenticate Faculty', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'faculty@edutrack.edu', password: 'Faculty@123' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.role).toBe('FACULTY');
    facultyToken = res.body.data.token;
  });

  it('POST /api/auth/login should authenticate Student', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@edutrack.edu', password: 'Student@123' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.role).toBe('STUDENT');
    studentToken = res.body.data.token;
  });

  it('GET /api/dashboard/admin should load statistical metrics & charts', async () => {
    const res = await request(app)
      .get('/api/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.statistics.total_students).toBeGreaterThan(0);
    expect(res.body.data.departmentDistribution.length).toBeGreaterThan(0);
  });

  it('GET /api/dashboard/faculty should load assigned courses for faculty', async () => {
    const res = await request(app)
      .get('/api/dashboard/faculty')
      .set('Authorization', `Bearer ${facultyToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.offerings).toBeDefined();
  });

  it('GET /api/dashboard/student should load student personal academics', async () => {
    const res = await request(app)
      .get('/api/dashboard/student')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.profile.roll_number).toBe('CS2023001');
  });

  it('GET /api/students should list students with pagination', async () => {
    const res = await request(app)
      .get('/api/students?limit=5')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(20);
  });

  it('GET /api/attendance/summary should compute correct attendance percentages', async () => {
    const res = await request(app)
      .get('/api/attendance/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/analytics/rankings should compute DENSE_RANK rankings', async () => {
    const res = await request(app)
      .get('/api/analytics/rankings')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].institutional_rank).toBe(1);
  });

  it('GET /api/audit-logs should return immutable audit logs for Admin', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
