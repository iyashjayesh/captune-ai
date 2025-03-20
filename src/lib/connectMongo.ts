import mongoose from "mongoose";

const connectMongoDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");
    } catch (error) {
        console.log(error);
    }
};

export default connectMongoDB;