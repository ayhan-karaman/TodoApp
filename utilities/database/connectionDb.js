const mongoose = require('mongoose');

const connetionString = 'mongodb://localhost:27017/todo-electron-app'

const connectionDb =  (cb)=> {
    mongoose.connect(connetionString)
    .then(()=> {
        console.log('MongoDb Connection Successful')
        cb();
    })
    .catch(err => console.log(err))
}

module.exports = connectionDb