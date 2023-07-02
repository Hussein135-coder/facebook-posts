const mongoose  = require('mongoose');

const pagesSchema = new mongoose.Schema({
    name:{
        type :String 
    } ,
    link: {
        type: String
    },
    post:{
        type: String
    },
    postLink: {
        type: String
    }
        
},{timestamps:true})

module.exports = mongoose.model('Posts', pagesSchema)