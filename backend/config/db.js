const mongoose=require('mongoose')

const connectDB=async ()=>{
    // console.log('mongo ', process.env.MONGO_URI);
    const conn=await mongoose.connect(process.env.MONGO_URI , { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    })
    
    console.log(`Mongo Db connected: ${conn.connection.host}`)
}

module.exports=connectDB