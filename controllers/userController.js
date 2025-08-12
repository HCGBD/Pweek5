const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require('express-async-handler');

const inscription = asyncHandler(async (req, res) => {
  const { nom, email, password, role } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Email deja utilise");
  }

  const userCreate = await User.create({ nom, email, password, role });

  if (userCreate) {
    res.status(201).json(userCreate);
  } else {
    res.status(400);
    throw new Error("Données utilisateur invalides");
  }
});

const connexion = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userExist = await User.findOne({ email });

  if (userExist && (await userExist.matchPassword(password))) {
    res.status(200).json({
      _id: userExist.id,
      nom: userExist.nom,
      email: userExist.email,
      role: userExist.role,
      token: generateToken(userExist.id, userExist.role),
    });
  } else {
    res.status(401);
    throw new Error("Email ou mot de passe incorrect !!");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
});

const updateUser = asyncHandler(async (req, res) => {
  const { nom, email, role } = req.body;
  const user = await User.findById(req.params._id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  user.nom = nom || user.nom;
  user.email = email || user.email;
  user.role = role || user.role;

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    nom: updatedUser.nom,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params._id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  await user.deleteOne();
  res.status(200).json({ message: "Utilisateur supprimé" });
});

module.exports = {
    inscription,
    connexion,
    getAllUsers,
    updateUser,
    deleteUser
}