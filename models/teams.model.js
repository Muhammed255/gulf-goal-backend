import mongoose from 'mongoose'

var teamSchema = new mongoose.Schema({
    teams:{
        team_name:{
            type:String,
            required:true
        },
        team_key:{
            type:String,
            required:true
        },
        team_badge:{
            type:String,
            required:true
        },
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

export default mongoose.model("Teams", teamSchema);