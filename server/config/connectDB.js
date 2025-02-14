import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected!!!")
    } catch (error) {   
        console.log(`Error in DB Connection : `, error.message);
        process.exit(1);
    }
}
export default connectDB;