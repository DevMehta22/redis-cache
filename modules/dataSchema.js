const mongoose = require("mongoose")
const dataSchema = new mongoose.Schema({
    name: String,
    email: String,
    rollno:String,
    phone_no:Number,   
},{
    timestamps:true
})

module.exports = mongoose.model("Data",dataSchema)
