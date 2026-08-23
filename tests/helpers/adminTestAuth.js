const Admin = require('../../src/models/Admin');

const getAdminCredentials = () => ({
  email: process.env.ADMIN_EMAIL || 'admin@boostvertex.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
});

const ensureTestAdmin = async () => {
  const { email, password } = getAdminCredentials();
  const normalizedEmail = String(email).trim().toLowerCase();
  let admin = await Admin.findOne({ email: normalizedEmail });

  if (!admin) {
    await Admin.create({
      name: 'Boost Vertex Admin',
      email: normalizedEmail,
      password,
      role: 'admin',
    });
    return;
  }

  admin.name = admin.name || 'Boost Vertex Admin';
  admin.role = admin.role || 'admin';
  admin.password = password;
  await admin.save();
};

const loginAsAdmin = async (app, request) => {
  await ensureTestAdmin();
  const credentials = getAdminCredentials();
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials)
    .expect(200);

  return {
    token: response.body.token,
    credentials,
    response,
  };
};

module.exports = {
  getAdminCredentials,
  ensureTestAdmin,
  loginAsAdmin,
};
