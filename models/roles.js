const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: { type: String, required: true },
    accessModules: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
