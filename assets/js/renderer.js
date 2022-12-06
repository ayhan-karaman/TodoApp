const { ipcRenderer } = require("electron");
const maxResBtn = document.querySelector('#maximizeBtn')
const ipc = ipcRenderer

maximizeBtn.addEventListener('click', ()=> {
     ipc.send('maximizeApp');
})
// Maximized & Restored 
function changeMaxResBtn(isMaximizedApp) {
    
    if(isMaximizedApp)
    {
        maxResBtn.title = "Restore";
        maxResBtn.classList.remove('maximize-btn')
        maxResBtn.classList.add('restore-btn')
       
    }else
    {
        maxResBtn.title = "Maximize";
        maxResBtn.classList.remove('restore-btn')
        maxResBtn.classList.add('maximize-btn')
      
        
    }
}
ipc.on('isMaximized', ()=> {  changeMaxResBtn(true) });
ipc.on('isRestored', ()=> { changeMaxResBtn(false) });



closeBtn.addEventListener('click', ()=> {
    ipc.send('closeApp')
})
minimizeBtn.addEventListener('click', ()=> {
    ipc.send('minimizeApp')
})


// CRUD Operations
checkTodoCount(); 
const todoValue = document.getElementById('todoValue');

// Input keypress event  added
todoValue.addEventListener("keypress", e => {
    if (e.keyCode == 13) {
      ipc.send("newTodo:save", {
        ref: "main",
        todoValue: e.target.value
      });
      e.target.value = "";
    }
  });

// Button event added
addBtn.addEventListener('click', () => {
     if(todoValue.value == "")
     {
         alert('Lütfen Yapılacak Görev Bilgisi Giriniz')
     }
     else{
        ipc.send('newTodo:save', {ref:'main', todoValue:todoValue.value})
        todoValue.value = "";
     }
})

ipc.on('todo:addItem', (e, todo) => {
    drawRow(todo)
})

ipc.on('initApp', (e, todos) => {
     todos.forEach(todo => {
        drawRow(todo)
     });
})

// extrat methods
function checkTodoCount () {
    const container = document.querySelector('.todo-container');
    const alertContainer = document.querySelector('.alert-container');
    document.querySelector('.total-count-container').innerText = container.children.length;

    if(container.children.length !== 0)
    {
         alertContainer.style.display = 'none'
    }
    else{
        alertContainer.style.display = 'block'
    }
}

const drawRow = (todo) => {
        //container...
        const container = document.querySelector(".todo-container");

        // row
        const row = document.createElement("div");
        row.className = "row";

        // col
        const col = document.createElement("div");
        col.className =
            "todo-item p-2 mb-3 text-light bg-dark col-md-12 shadow card d-flex justify-content-center flex-row align-items-center";

        // p
        const p = document.createElement("p");
        p.className = "m-0 w-100";
        p.innerText = todo.text;

        // Sil Btn
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-outline-danger delete-btn flex-shrink-1";
        deleteBtn.title = "Delete Todo";
        deleteBtn.setAttribute("data-id", todo.id)

        deleteBtn.addEventListener("click", e => {
            if (confirm("Bu Kaydı Silmek İstediğinizden Emin misiniz?")) {
            e.target.parentNode.parentNode.remove();
            ipc.send("remove:todo", e.target.getAttribute("data-id"))
            checkTodoCount();
            }
        });

        col.appendChild(p);
        col.appendChild(deleteBtn);

        row.appendChild(col);

        container.appendChild(row);
        checkTodoCount();
}