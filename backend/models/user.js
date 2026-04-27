const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
        type: String,
        enum: ['student', 'admin', 'controller', 'coordinator', 'vc'],
        default: 'student'
    },
    studentId: { type: String },
    department: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
// userSchema.pre('save', async function (next) {
//     try {
//         if (!this.isModified('password')) return next();

//         // const bcrypt = require('bcryptjs');
//         this.password = await bcrypt.hash(this.password, 10);

//         next();
//     } catch (err) {
//         next(err);
//     }
// });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);