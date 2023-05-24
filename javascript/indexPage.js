const dashboardLink = document.getElementById("dashboardLink");
const completedTasksLink = document.getElementById("completedTasksLink");
const dashboard = document.getElementById("dashboard");
const completedTasks =  document.getElementById("completedTasks");
const sortButton = document.getElementById("sortButton");
const modalForm = document.getElementById("modalForm");
const ascending = document.getElementById("ascending");
const descending = document.getElementById("descending");
const removeSort = document.getElementById("removeSort");
const saveButton = document.getElementById("saveButton");
const closeButton = document.getElementById("closeButton");


saveButton.addEventListener("click", insertTask);
saveButton.addEventListener("click", closeModal);
closeButton.addEventListener("click", closeModal);

dashboardLink.addEventListener("click", showDashboard);
completedTasksLink.addEventListener("click", showCompletedTasks);
modalForm.addEventListener("input", formValidation);
ascending.addEventListener("click", sortTableAscending);
descending.addEventListener("click", sortTableDescending);
removeSort.addEventListener("click", unsortedTable);


// initialize the DB
const createQuery = "CREATE TABLE taskdata (task_id INTEGER PRIMARY KEY, task_name TEXT, description TEXT, category TEXT, priority TEXT, due_date TEXT, status TEXT);";
var dbAPI = new DB(createQuery, renderTableData);


function showDashboard(){
  dashboard.classList.add("show");
  completedTasks.classList.remove("show");
  dashboardLink.classList.add("active");
  completedTasksLink.classList.remove("active");
  renderTableData("Open");
}

function showCompletedTasks(){
  completedTasks.classList.add("show");
  dashboard.classList.remove("show");
  completedTasksLink.classList.add("active");
  dashboardLink.classList.remove("active");
  renderTableData("Done");
}

function closeModal(){
  modalForm.reset();
  saveButton.disabled = true;
  document.querySelector(".error").style.display="none";
}

function formValidation() {
  const error = document.querySelector(".error");
  var taskName = document.getElementById("taskName").value;
  var dueDate = document.getElementById("dueDate").value;
  var result = dbAPI.select("SELECT task_name FROM taskdata WHERE task_name = ?",[taskName]);
  if(result.length ===0 ){
     if (taskName === "" || dueDate === "") {
        saveButton.disabled = true;
      } else {
        saveButton.disabled = false;
  }
  error.style.display = "none";
}
else{
  error.textContent = "Task name already existed. Try with a different name.";
  error.style.display = "block";
  saveButton.disabled = true;
}
}

function insertTask() {
  var taskID = Date.now();
  var taskName = document.getElementById("taskName").value;
  var description = document.getElementById("description").value;
  var dueDate = document.getElementById("dueDate").value;
  var category = document.getElementById("categoryDropDown").value;
  var priority = document.getElementById("priorityDropDown").value;
  var status="Open";
  dbAPI.insert("INSERT INTO taskdata VALUES (?, ?, ?, ?, ?, ?,?)", [taskID, taskName, description, category, priority,  dueDate, status]);
  renderTableData("Open");
}


function deleteTask(taskName) {
    dbAPI.delete("DELETE FROM taskdata WHERE task_name = ?", [taskName]);
    if(dashboard.classList.contains("show")){
        renderTableData("Open");
    }
    else{
        renderTableData("Done");
    }
}


function moveToComplete(taskName) {
  dbAPI.update("UPDATE taskdata SET status = 'Done' WHERE task_name = ?", [taskName]);
  renderTableData("Open");
}


function sortTableAscending() {
  let element, result, statusValue;
  if(dashboard.classList.contains("show")){
    element = document.querySelector(".dashBoardTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Open' ORDER BY due_date ASC");  
    statusValue = "Open";
  }
  else{
    element = document.querySelector(".completedTasksTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Done' ORDER BY due_date ASC");
    statusValue = "Done";
  }
  if (result.length === 0) {
    element.innerHTML = "";
    return;
  }

  // construct the header
  let headerString = '<th></th>';
  result[0].columns.forEach((headerValue) => {
    headerString += `<th>${headerValue}</th>`;
  });
  headerString += '<th> </th>';
  headerString = `<tr>${headerString}</tr>`;

 
  let rowString = "", tableRows = "";
  result[0].values.forEach((row) => {
    if(statusValue === "Open"){
      rowString = `<td> <input class="form-check-input" type="checkbox" value="" onchange="moveToComplete('${row[0]}')"> </td>`;
    }
    else{
      rowString = '<td> <input class="form-check-input" type="checkbox" value="" checked disabled> </td>';
    }
    
    row.forEach((cellValue) => {
      rowString += `<td>${cellValue}</td>`;
    });
    rowString += `<td><button class="btn btn-primary" onclick="deleteTask('${row[0]}')">Delete</button></td>`;
    rowString = `<tr>${rowString}</tr>`;
    tableRows += rowString;
  });

  // render the table
  let tableString = `<table>${headerString}${tableRows}</table>`;

  // insert the tableString into the table
  element.innerHTML = tableString;
}

function sortTableDescending() {
  let element, result, statusValue;
  if(dashboard.classList.contains("show")){
    element = document.querySelector(".dashBoardTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Open' ORDER BY due_date DESC"); 
    statusValue = "Open";
  }
  else{
    element = document.querySelector(".completedTasksTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Done' ORDER BY due_date DESC"); 
    statusValue = "Done";
  }
 if (result.length === 0) {
  element.innerHTML = "";
  return;
}

// construct the header
let headerString = '<th></th>';
result[0].columns.forEach((headerValue) => {
  headerString += `<th>${headerValue}</th>`;
});
headerString += '<th> </th>';
headerString = `<tr>${headerString}</tr>`;


let rowString = "", tableRows = "";
result[0].values.forEach((row) => {
  if(statusValue === "Open"){
    rowString = `<td> <input class="form-check-input" type="checkbox" value="" onchange="moveToComplete('${row[0]}')"> </td>`;
  }
  else{
    rowString = '<td> <input class="form-check-input" type="checkbox" value="" checked disabled> </td>';
  }
  
  row.forEach((cellValue) => {
    rowString += `<td>${cellValue}</td>`;
  });
  rowString += `<td><button class="btn btn-primary" onclick="deleteTask('${row[0]}')">Delete</button></td>`;
  rowString = `<tr>${rowString}</tr>`;
  tableRows += rowString;
});

// render the table
let tableString = `<table>${headerString}${tableRows}</table>`;

// insert the tableString into the table
element.innerHTML = tableString;
}

function unsortedTable() {
  if(dashboard.classList.contains("show")){
    renderTableData("Open");
 }
 else{
    renderTableData("Done");
 }

}

function renderTableData(statusValue) {
  let element, result;
  if(statusValue === "Open"){
     element=document.querySelector(".dashBoardTable");
     result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Open' ORDER BY task_id DESC");  
  }else{
    element=document.querySelector(".completedTasksTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Done' ORDER BY task_id DESC"); 
  }

  if (result.length === 0) {
    element.innerHTML = "";
    return;
  }

  // construct the header
  let headerString = '<th></th>';
  result[0].columns.forEach((headerValue) => {
    headerString += `<th>${headerValue}</th>`;
  });
  headerString += '<th> </th>';
  headerString = `<tr>${headerString}</tr>`;

 
  let rowString = "", tableRows = "";
  result[0].values.forEach((row) => {
    if(statusValue === "Open"){
      rowString = `<td> <input class="form-check-input" type="checkbox" value="" onchange="moveToComplete('${row[0]}')"> </td>`;
    }
    else{
      rowString = '<td> <input class="form-check-input" type="checkbox" value="" checked disabled> </td>';
    }
    
    row.forEach((cellValue) => {
      rowString += `<td>${cellValue}</td>`;
    });
    rowString += `<td><button class="btn btn-primary" onclick="deleteTask('${row[0]}')">Delete</button></td>`;
    rowString = `<tr>${rowString}</tr>`;
    tableRows += rowString;
  });

  // render the table
  let tableString = `<table>${headerString}${tableRows}</table>`;

  // insert the tableString into the table
  element.innerHTML = tableString;
}
