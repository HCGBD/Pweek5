const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDb = require('../configs/database');

describe('User API', () => {
  // Avant tous les tests, se connecter à la base de données
  beforeAll(async () => {
    // Utiliser la même fonction de connexion que l'application
    // Pour un environnement de test réel, vous devriez utiliser une base de données de test séparée
    // Par exemple, en configurant process.env.MONGO_URL pour pointer vers une base de données de test
    await connectDb.connectDbTest();
  });

  // Après chaque test, nettoyer la collection d'utilisateurs
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Après tous les tests, déconnecter la base de données
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('devrait enregistrer un nouvel utilisateur', async () => {
    const userData = {
      nom: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'member',
    };

    const res = await request(app)
      .post('/api/users/inscription')
      .send(userData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toEqual(userData.email);
    expect(res.body).not.toHaveProperty('password'); // Le mot de passe ne doit pas être retourné

    const userInDb = await User.findOne({ email: userData.email });
    expect(userInDb).not.toBeNull();
    expect(userInDb.email).toEqual(userData.email);
  });

  it('ne devrait pas enregistrer un utilisateur avec un email existant', async () => {
    const userData = {
      nom: 'Test User',
      email: 'existing@example.com',
      password: 'password123',
      role: 'member',
    };

    // Créer un utilisateur une première fois
    await request(app)
      .post('/api/users/inscription')
      .send(userData);

    // Tenter de créer le même utilisateur une seconde fois
    const res = await request(app)
      .post('/api/users/inscription')
      .send(userData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Email deja utilise');
  });

  it('devrait retourner une erreur de validation pour les données manquantes', async () => {
    const userData = {
      nom: 'Test User',
      // email manquant
      password: 'password123',
      role: 'member',
    };

    const res = await request(app)
      .post('/api/users/inscription')
      .send(userData);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Erreur de validation');
  });
});
