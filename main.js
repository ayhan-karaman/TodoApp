const {app, BrowserWindow, ipcMain} = require('electron');
ipc = ipcMain
const path = require('path')
const url = require('url');
const connectionDb = require('./utilities/database/connectionDb');
const Todo = require('./models/todo');


// Create Window Method
const createWindow = ()=>{
    const win = new BrowserWindow({
        width:560,
        height:680,
        minWidth:560,
        minHeight:680,
        frame:false,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false,
            devTools:true,
            // preload:path.join(__dirname, 'preload.js')
        }
    })
    win.loadURL(
        url.format({
            pathname:path.join(__dirname, 'pages/index.html'),
            protocol:'file:',
            slashes:true
        })
    )
    
    // Navbar Click Operations
    ipc.on('maximizeApp', ()=> {
        if(win.isMaximized())
        {
            win.unmaximize()
        }
        else
        {
            win.maximize()
        }
    })

    ipc.on('closeApp', ()=> {
           app.quit();
    })
    ipc.on('minimizeApp', ()=> {
        win.minimize();
    })

    win.on('maximize', ()=> {
        win.webContents.send('isMaximized')
    })
    win.on('unmaximize', ()=> {
        win.webContents.send('isRestored')
    })

    // CRUD Todo Operations
    ipc.on('newTodo:save', (err, data) => {
        if(data)
        {
            const todo = new Todo({text:data.todoValue});
            todo.save()
            win.webContents.send('todo:addItem', {
                id:todo._id.toString(),
                text:todo.text,
                createdAt:todo.createdAt
            });
        }
    }) 
    win.webContents.once('dom-ready', ()=> {
        let modifiedTodos = [];
        Todo.find()
        .then(todos => {
             todos.forEach(todo => {
                let modified = {};
                modified.id = todo._id.toString();
                modified.text = todo.text;
                modified.createdAt = todo.createdAt;
                modifiedTodos.push(modified)
             });
             win.webContents.send('initApp', modifiedTodos)
        })
        .catch(err => console.log(err))
    })

    ipc.on("remove:todo", (err, id) => {
           Todo.deleteOne({_id:id})
           .then(() => {
                win.webContents.send('message', {
                    message:'Silme işlemi Tamamlandı'
                })
           })
           .catch(err => {
                console.log(err)
           })
    })



} 

app.on('ready', ()=> {

    connectionDb(()=> {
        createWindow();
    })
   

    app.on('activate', ()=>{
        if(BrowserWindow.getAllWindows().length === 0)
        {
            connectionDb(()=> {
                createWindow();
            })
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })