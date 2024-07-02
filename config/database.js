const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
    console.log("MongoDB connection opened!");
});

mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully!");
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected!");
});

mongoose.connection.on("error", () => {
    console.error("Error while connecting to mongoDB");
});

module.exports = mongoose;