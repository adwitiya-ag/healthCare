import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
 {
    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true //for speeding up query
    },

    phoneNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    employeeId: {
        type: String,
        unique: true,
        required: true
    },

    regNo: {
    type: String,
    unique: true,
    required: true
    },

    role: {
        type: String,
        enum: ["ADMIN", "MANAGER", "MR"],
        required: true
    },

    manager: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

    refreshToken: {
        type: String,
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    }
    },
  {
    timestamps: true
  }
);

// Need to look at it, why next is failing

//Password Hook
// userSchema.pre("save", async function (next){
//     try {
//         if (!this.isModified("password"))
//             return next();
    
//         this.password = await bcrypt.hash(this.password, 10);
//         next();
//     } catch (error) {
//         console.log("Error: ", error.message);
//     }
// });


userSchema.pre("save", async function (){
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});



//Password Comparison
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

//Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
            employeeId: this.employeeId
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
