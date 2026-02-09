import { betterAuth} from "better-auth";
import { connectDB } from "./mongodb";
import bcrypt from "bcrypt";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { Db } from "mongodb";

async function getMongoDB() {
    const mongooseConnection = await connectDB();
    // Get the native MongoDB database instance from Mongoose connection
    return mongooseConnection.connection.db;
  }

export const auth = betterAuth({
    database: mongodbAdapter(await getMongoDB() as Db),
    baseURL: process.env.NEXT_PUBLIC_BASE_URL ,
    user:{
        additionalFields: {
            role: {
                type: "string",
                input: true,
              } 
          },
    },
    emailAndPassword: {
        enabled: true,
        async verifyPassword({password, hashedPassword}:{password: string, hashedPassword: string}){
            return await bcrypt.compare(password, hashedPassword);
        },
        async hashPassword({password}:{password: string}){
            return await bcrypt.hash(password, 10);
        },
    },
});