import mongoose from 'mongoose';
import crypto from 'crypto';
import { v4 as uuid} from 'uuid';


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    about: {
        type: String,
        trim: true
    },
    salt: String,
    role: {
        type: Number,
        default: 0
    },
    history: {
        type: Array,
        default: []
    }
}, {timestamps: true});


userSchema.virtual('password')
.set(function(password) {
    this._password = password;
    this.salt = uuid();
    this.hashed_password = this.encryptPassword(password);
})
.get(function() {
    return this._password
});

userSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    encryptPassword: function(password) {
        if(!password) return '';
        try {
            return crypto.createHmac('sha1', this.salt)
                            .update(password)
                            .digest('hex');
        } catch (err) {
            console.log(err);
            return '';
        }
    }
}

const User = mongoose.model("User", userSchema);

export default User;