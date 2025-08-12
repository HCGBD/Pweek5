const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const inscription = async (req, res) => {
  const { nom, email, password, role } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email deja utilise" });
    }

    const userCreate = await User.create({nom, email, password, role });

    return res.status(201).json(userCreate);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

const connexion = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist && userExist.matchPassword(password)) {
      return res.status(200).json({
        _id: userExist.id,
        nom: userExist.nom,
        email: userExist.email,
        role: userExist.role,
        token: generateToken(userExist.id, userExist.role),
      });
    } else {
      res.status(401).json({ message: "email ou mot de passe incorrect !!" });
    }
  } catch (error) {
     res.status(500).json({ message: "Erreur serveur", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

const updateUser = async (req, res) => {
  try {
    const { nom, email, role } = req.body;
    const user = await User.findById(req.params._id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
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
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params._id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

module.exports = {
    inscription,
    connexion,
    getAllUsers,
    updateUser,
    deleteUser
}