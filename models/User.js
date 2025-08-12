const mongo = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongo.Schema(
  {
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);

userSchema.pre('save',async function (next){
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
    next();
})

userSchema.methods.matchPassword =  async function (passwordEntrer) {
    return await bcrypt.compare(passwordEntrer,this.password)
}

module.exports = mongo.model("User",userSchema);
