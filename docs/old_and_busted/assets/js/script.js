let data = {
  students: {},
  faculty: {},
  classes: {},
  attendance: {}
};

var firebaseConfig = {
  apiKey: "AIzaSyCYH7blRN_i5uW3F5l1BWD_3I0uwZIQeUQ",
  authDomain: "attendance-tracker-adb41.firebaseapp.com",
  databaseURL: "https://attendance-tracker-adb41.firebaseio.com",
  projectId: "attendance-tracker-adb41",
  storageBucket: "attendance-tracker-adb41.appspot.com",
  messagingSenderId: "826609505931",
  appId: "1:826609505931:web:73af7efcac227f0d7a668e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

setView("AttendanceView");

/***********************************
Handle Views
***********************************/
let navLinks = document.getElementsByClassName("left-nav");
for(i in navLinks) {
  if(!isElement(navLinks[i])) continue;
  navLinks[i].addEventListener('click', function(e) {
    let action = e.target.childNodes[2].data.trim();
    setView(action + "View")
  })
}

function setView(viewName, dataID) {
  generateStudentTable();
  generateFacultyTable();
  generateClassesTable();
  generateAttendanceView();
  let views = document.getElementsByTagName("main");
  if(viewName == "classDetail") prepClassDetail(dataID);
  for(i in views) {
    if(!isElement(views[i])) continue;
    if(views[i].id == viewName) views[i].removeAttribute("hidden");
    else views[i].setAttribute("hidden", "true");
  }
}

/***********************************
Handle Accounts
***********************************/
function login() {
  console.log("LOGIN");
}

function logout() {
  console.log("LOGOUT");
}

/***********************************
Handle Students
***********************************/

//Create Student
document.getElementById("addStudentForm").addEventListener("keyup", function(e) {
  if(e.key != "Enter") return false;  //Only continue if Enter is pressed

  let inputs = e.target.parentNode.getElementsByTagName("input"); //Get input fields

  //Make sure none are blank
  for(i in inputs) {
    if(!isElement(inputs[i])) continue;
    if(inputs[i].value == "") return false;
  }

  console.log("Inputs not blank")

  let id = inputs[0].value;
  let first = inputs[1].value;
  let last = inputs[2].value;

  if(data.students[id] != null) {
    alert("Please enter a unique ID");
    return false;
  }

  firebase.database().ref('students/' + id).set({
      first_name: first,
      last_name: last
    });

  //Clear fields
  for(i in inputs) {
    if(!isElement(inputs[i])) continue;
    inputs[i].value = ""
  }
  inputs[0].focus();
});
 

firebase.database().ref('students').on('value', function(snapshot) {
  let temp = snapshot.val()
  data.students = {};

  for(i in temp) {
    if(data.students[i] == null) {
      data.students[i] = {
        first_name: temp[i].first_name,
        last_name: temp[i].last_name,
        lates: [],
        absences: [],
        classes: []
      }
    } else {
      data.student[i].first_name = temp[i].first_name;
      data.student[i].last_name = temp[i].last_name;
    }
  }
  generateStudentTable();
})

function generateStudentTable() {
  let table = document.getElementById("studentTable");
  table.innerHTML = "";
  for(i in data.students) {
    let tr = document.createElement("tr");

    let idTD = document.createElement("td");
    idTD.innerText = i;
    tr.append(idTD);

    let nameTD = document.createElement("td");
    nameTD.innerText = data.students[i].first_name + " " + data.students[i].last_name;
    tr.append(nameTD);

    let latesTD = document.createElement("td");
    latesTD.innerText = data.students[i].lates.length;
    tr.append(latesTD);

    let absencesTD = document.createElement("td");
    absencesTD.innerText = data.students[i].absences.length;

    tr.append(absencesTD);
    table.append(tr);
  }
}


/***********************************
Handle Faculty
***********************************/

//Create Teacher
document.getElementById("addFacultyForm").addEventListener("keyup", function(e) {
  if(e.key != "Enter") return false;  //Only continue if Enter is pressed

  let inputs = e.target.parentNode.getElementsByTagName("input"); //Get input fields

  //Make sure none are blank
  for(i in inputs) {
    if(!isElement(inputs[i])) continue;
    if(inputs[i].value == "") return false;
  }

  let id = inputs[0].value;
  let first = inputs[1].value;
  let last = inputs[2].value;
  let email = inputs[3].value;

  if(data.faculty[id] != null) {
    alert("Please enter a unique ID");
    return false;
  }

  firebase.database().ref('faculty/' + id).set({
      first_name: first,
      last_name: last,
      email: email
    });

  //Clear fields
  for(i in inputs) {
    if(!isElement(inputs[i])) continue;
    inputs[i].value = ""
  }
  inputs[0].focus();
});

firebase.database().ref('faculty').on('value', function(snapshot) {
  let temp = snapshot.val()
  data.faculty = {};

  for(i in temp) {
    if(data.faculty[i] == null) {
      data.faculty[i] = {
        first_name: temp[i].first_name,
        last_name: temp[i].last_name,
        email: temp[i].email,
        classes: []
      }
    } else {
      data.faculty[i].first_name = temp[i].first_name;
      data.faculty[i].last_name = temp[i].last_name;
      data.faculty[i].email = temp[i].email;
    }
  }
  generateFacultyTable();
})

function generateFacultyTable() {
  let table = document.getElementById("facultyTable");
  table.innerHTML = "";
  for(i in data.faculty) {
    let tr = document.createElement("tr");

    let idTD = document.createElement("td");
    idTD.innerText = i;
    tr.append(idTD);

    let nameTD = document.createElement("td");
    nameTD.innerText = data.faculty[i].first_name + " " + data.faculty[i].last_name;
    tr.append(nameTD);

    let emailTD = document.createElement("td");
    emailTD.innerText = data.faculty[i].email;
    tr.append(emailTD);

    let classCountTD = document.createElement("td");
    classCountTD.innerText = data.faculty[i].classes.length;
    tr.append(classCountTD);

    table.append(tr);
  }
}


/***********************************
Handle Classes
***********************************/

//Create Student
document.getElementById("addCourseForm").addEventListener("keyup", function(e) {
  if(e.key != "Enter") return false;  //Only continue if Enter is pressed

  let inputs = e.target.parentNode.getElementsByTagName("input"); //Get input fields

  //Make sure none are blank
  for(i in inputs) {
    if(!isElement(inputs[i])) continue;
    if(inputs[i].value == "") return false;
  }

  let id = inputs[0].value;
  let name = inputs[1].value;


  if(data.classes[id] != null) {
    alert("Please enter a unique ID");
    return false;
  }

  firebase.database().ref('classes/' + id).set({
      name: name,
      days: {
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
      }
    });

  //Clear fields
  for(i in inputs) {
    if(!isElement(inputs[i])) continue;
    inputs[i].value = ""
  }
  inputs[0].focus();
});

firebase.database().ref('classes').on('value', function(snapshot) {
  let temp = snapshot.val()
  data.classes = {};

  for(i in temp) {
    let c = temp[i];
    if(c.roster == null) c.roster = [];
    if(c.teachers == null) c.teachers = [];
    // if(c.groups == null) c.groups = [];
    data.classes[i] = c;
  }
  generateClassesTable();
})

function generateClassesTable() {
  let table = document.getElementById("classTable");
  table.innerHTML = "";
  for(i in data.classes) {
    let tr = document.createElement("tr");
    // tr.setAttribute("classID", i);
    tr.setAttribute("onclick", "setView('classDetail', '" + i + "')");

    let numberTD = document.createElement("td");
    numberTD.innerText = i;
    tr.append(numberTD);

    let nameTD = document.createElement("td");
    nameTD.innerText = data.classes[i].name;
    tr.append(nameTD);

    let studentCountTD = document.createElement("td");
    studentCountTD.innerText = Object.keys(data.classes[i].roster).length;
    tr.append(studentCountTD);

    let teacherCountTD = document.createElement("td");
    teacherCountTD.innerText = Object.keys(data.classes[i].teachers).length;
    tr.append(teacherCountTD);

    // let groupsTD = document.createElement("td");
    // groupsTD.innerText = data.classes[i].groups.toString();
    // tr.append(groupsTD);

    table.append(tr);
  }
}


/***********************************
Attendance View
***********************************/

//Load the attendance
// firebase.database().ref('classes').once('value', function(snapshot) {
//   generateAttendanceView();
// });

function generateAttendanceView(date = new Date()) {
  //Display the date at the top
  let month = date.getMonth();
  let year = date.getFullYear();
  let dateNumber = date.getDate();
  let day = date.getDay();
  let monthString = month + 1;
  if(monthString < 10) monthString = "0" + monthString;
  let dateNumberString = dateNumber;
  if(dateNumberString < 10) dateNumberString = "0" + dateNumberString;
  let dateString = year + "-" + monthString + "-" + dateNumberString;
  let headerDate = document.getElementById("attendanceDate");
  headerDate.innerText = getMonthString(month) + " " + dateNumber + ", " + year + " - " + getDayString(day)

  //Create the accordian with all of today's classes
  let accord = document.getElementById("todaysClassesAccordion");
  accord.innerHTML = "";
  for(classId in data.classes) {
    if(!data.classes[classId].days[getDayString(day)]) continue;
    let className = data.classes[classId].name;

    let card = document.createElement("div");
    card.classList.add("card");

    let cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");
    
    let h2 = document.createElement("h2");
    cardHeader.classList.add("mb-0");
    
    let button = document.createElement("button");
    button.setAttribute("class", "btn btn-link btn-block text-left");
    button.setAttribute("data-toggle", "collapse");
    button.setAttribute("data-target", "#" + className + "-accordian");
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-controls", className + "-accordian");
    button.innerText = className;

    h2.append(button);
    cardHeader.append(h2);
    card.append(cardHeader);

    let collapse = document.createElement("div");
    collapse.classList.add("collapse");
    collapse.setAttribute("id", className + "-accordian");

    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    let ul = document.createElement("ul");
    ul.setAttribute("class", "list-group");

    for(studentId in data.classes[classId].roster) {
      let li = document.createElement("li");
      li.setAttribute("class", "list-group-item attendance-list-item");
      li.setAttribute("studentId", studentId);

      let nameSpan = document.createElement('span');
      nameSpan.innerText = data.students[studentId].first_name + " " + data.students[studentId].last_name;
      nameSpan.setAttribute("class", "attendance-name-span col-sm");
      li.append(nameSpan);

      let buttonSpan = document.createElement('span');
      buttonSpan.setAttribute("class", "attendance-button-span col-sm");
      
      let buttonGroup = document.createElement('div');
      buttonGroup.setAttribute("class", "btn-group btn-group-toggle");

      let currentStatus = data.attendance[dateString][classId][studentId].status;
      let currentNote = data.attendance[dateString][classId][studentId].note;
      if(currentStatus == null) currentStatus = "Not Taken";
      if(currentNote == null) currentNote = "";

      //Present
      let labelPresent = document.createElement('label');
      labelPresent.setAttribute("class", "btn btn-outline-success");
      if(currentStatus == "Present") labelPresent.classList.add("active");

      let inputPresent = document.createElement("input");
      inputPresent.setAttribute("type", "radio");
      inputPresent.setAttribute("studentId", studentId);
      inputPresent.setAttribute("classId", classId);
      inputPresent.setAttribute("dateString", dateString);
      inputPresent.setAttribute("status", "Present");
      inputPresent.setAttribute("onclick", "takeAttendance(this)");
      // inputPresent.innerText = "Present"
      labelPresent.append(inputPresent);
      labelPresent.append("Present");

      buttonGroup.append(labelPresent);

      //Late
      let labelLate = document.createElement('label');
      labelLate.setAttribute("class", "btn btn-outline-warning");
      if(currentStatus == "Late") labelLate.classList.add("active");

      let inputLate = document.createElement("input");
      inputLate.setAttribute("type", "radio");
      inputLate.setAttribute("studentId", studentId);
      inputLate.setAttribute("classId", classId);
      inputLate.setAttribute("dateString", dateString);
      inputLate.setAttribute("status", "Late");
      inputLate.setAttribute("onclick", "takeAttendance(this)");
      // inputLate.innerText = "Late"
      labelLate.append(inputLate);
      labelLate.append("Late");

      buttonGroup.append(labelLate);

      //Absent
      let labelAbsent = document.createElement('label');
      labelAbsent.setAttribute("class", "btn btn-outline-danger");
      if(currentStatus == "Absent") labelAbsent.classList.add("active");

      let inputAbsent = document.createElement("input");
      inputAbsent.setAttribute("type", "radio");
      inputAbsent.setAttribute("studentId", studentId);
      inputAbsent.setAttribute("classId", classId);
      inputAbsent.setAttribute("dateString", dateString);
      inputAbsent.setAttribute("status", "Absent");
      inputAbsent.setAttribute("onclick", "takeAttendance(this)");
      // inputAbsent.innerText = "Absent"
      labelAbsent.append(inputAbsent);
      labelAbsent.append("Absent");

      buttonGroup.append(labelAbsent);

      buttonSpan.append(buttonGroup);

      let outerDiv = document.createElement("div");
      outerDiv.setAttribute("class", "attendance-notes");

      let inputGroup = document.createElement("span");
      inputGroup.setAttribute("class", "input-group mb-3");

      let inputGroupPrepend = document.createElement("div");
      inputGroupPrepend.setAttribute("class", "input-group-prepend");

      let inputGroupText = document.createElement("span");
      inputGroupText.setAttribute("class", "input-group-text");
      inputGroupText.append("Notes");

      inputGroupPrepend.append(inputGroupText);
      inputGroup.append(inputGroupPrepend);

      let noteInput = document.createElement("input");
      noteInput.setAttribute("type", "text");
      noteInput.setAttribute("class", "form-control");
      noteInput.setAttribute("studentId", studentId);
      noteInput.setAttribute("classId", classId);
      noteInput.setAttribute("dateString", dateString);
      noteInput.setAttribute("onkeyup", "addAttendanceNote(this)");
      noteInput.setAttribute("onblur", "addAttendanceNote(this)");
      noteInput.value = currentNote;

      inputGroup.append(noteInput);
      outerDiv.append(inputGroup)
      buttonSpan.append(outerDiv);

      li.append(buttonSpan);


      ul.append(li);
    }

    cardBody.append(ul);
    collapse.append(cardBody);
    card.append(collapse);

    accord.append(card);
  }
}

function takeAttendance(b) {
  let studentId = b.getAttribute("studentId");
  let classId = b.getAttribute("classId");
  let dateString = b.getAttribute("dateString");
  let status = b.getAttribute("status");

  data.attendance[dateString][classId][studentId].status = status;
  firebase.database().ref("attendance/" + dateString + "/" + classId + "/" + studentId + "/" + "status").set(status);
  let buttons = b.parentNode.parentNode.childNodes;
  buttons[0].classList.remove("active");
  buttons[1].classList.remove("active");
  buttons[2].classList.remove("active");
  b.parentNode.classList.add("active");
  b.blur();
}

function addAttendanceNote(input) {
  let studentId = input.getAttribute("studentId");
  let classId = input.getAttribute("classId");
  let dateString = input.getAttribute("dateString");
  let note = input.value;
  data.attendance[dateString][classId][studentId].note = note;
  firebase.database().ref("attendance/" + dateString + "/" + classId + "/" + studentId + "/" + "note").set(note);
}

firebase.database().ref("attendance").once("value", function(snapshot) {
  data.attendance = snapshot.val();
  if(data.attendance == null) {
    data.attendance = {};
  } 
  let date = new Date();
  let month = date.getMonth() + 1;
  if(month < 10) month = "0" + month;
  let dateNumber = date.getDate();
  if(dateNumber < 10) dateNumber = "0" + dateNumber; 
  let day = date.getDay();
  let dateString = date.getFullYear() + "-" + month + "-" + dateNumber;
  if(day < 1 || day > 5) return false;
  let isFirst = false;
  if(data.attendance[dateString] == null) {
    data.attendance[dateString] = {}
    isFirst = true;
  }

  for(id in data.classes) {
    let c = data.classes[id];
    if(c.days[getDayString(day)]) {
      if(data.attendance[dateString][id] == null) {
        data.attendance[dateString][id] = {};

        for(studentId in c.roster) {
          data.attendance[dateString][id][studentId] = {
            status: "Not Taken"
          }
        }
      }
    }
  }

  if(isFirst) {
    firebase.database().ref("attendance/" + dateString).set(data.attendance[dateString]);
  }

  generateAttendanceView();
})


/***********************************
Class Details
***********************************/
function prepClassDetail(classId) {
  //Dispay the name at the top
  document.getElementById("classDetailName").innerText = data.classes[classId].name + " (" + classId + ")";
  //Add the class id as an attribute so we can update it
  document.getElementById("classDetail").setAttribute("classId", classId);

  //Fill out the check boxes
  let weekCheckBoxes = document.getElementById("weekCheckBoxes").getElementsByTagName("input");
  for(i in weekCheckBoxes) {
    let dayBox = weekCheckBoxes[i];
    if(!isElement(dayBox)) continue;
    dayBox.checked = data.classes[classId].days[dayBox.value]
  }

  //List the teachers
  document.getElementById("classDetailTeachers").innerHTML = "";
  for(id in data.classes[classId].teachers) {
    let name = data.faculty[id].first_name + " " + data.faculty[id].last_name;
    document.getElementById("classDetailTeachers").innerHTML += '<div class="chip" teacherId="' + id + '">' + name + '<span class="closebtn" onclick="removeTeacherChipFromClass(this)">&times;</span></div>'
  }

  //List the students
  document.getElementById("classDetailStudents").innerHTML = "";
  for(id in data.classes[classId].roster) {
    let name = data.students[id].first_name + " " + data.students[id].last_name;
    document.getElementById("classDetailStudents").innerHTML += '<li class="list-group-item" studetId="' + id + '">' + name + '</li>'
  }
  
}

//Update days the class runs in the db
function weekCheckBoxes(box) {
  let day = box.getAttribute("value");
  let classId = document.getElementById("classDetail").getAttribute("classId")
  firebase.database().ref('classes/' + classId + "/days/" + day).set(box.checked)
}

//Add a new teacher to the class through the input field
document.getElementById("addTeacherToClassInput").addEventListener("keyup", function(e) {
  if(e.key == "Enter") {
    let teacherId = getId("faculty", document.getElementById("addTeacherToClassInput").value);
    let classId = document.getElementById("classDetail").getAttribute("classId");
    addTeacherToClass(teacherId, classId)
    document.getElementById("addTeacherToClassInput").value = "";
  }
})

function addTeacherToClass(teacherId, classId) {
  //Prevent duplicates
  for(id in data.classes[classId].teachers) {
    if(id == teacherId) return false;
  }

  let name = data.faculty[teacherId].first_name + " " + data.faculty[teacherId].last_name
  document.getElementById("classDetailTeachers").innerHTML += '<div class="chip" teacherId="' + teacherId + '">' + name + '<span class="closebtn" onclick="removeTeacherChipFromClass(this)">&times;</span></div>'
  firebase.database().ref('classes/' + classId + "/teachers/" + teacherId).set(true);
  return true;
}

//Add a new student to the class through the input field
document.getElementById("addStudentToClassInput").addEventListener("keyup", function(e) {
  if(e.key == "Enter") {
    let studentId = parseInt(document.getElementById("addStudentToClassInput").value.split("ID# ")[1]);
    let classId = document.getElementById("classDetail").getAttribute("classId");
    addStudentToClass(studentId, classId)
    document.getElementById("addStudentToClassInput").value = "";
  }
})

function addStudentToClass(studentId, classId) {
  console.log(studentId, classId);
  // Prevent duplicates
  for(id in data.classes[classId].roster) {
    if(id == studentId) return false;
  }

  let name = data.students[studentId].first_name + " " + data.students[studentId].last_name
  document.getElementById("classDetailStudents").innerHTML += '<li class="list-group-item" studetId="' + studentId + '">' + name + '</li>'
  firebase.database().ref('classes/' + classId + "/roster/" + studentId).set(true);
  // return true;
}

//Removes a teacher from a class. If you don't include a classId it removes the teacher from all classes
function removeTeacherFromClass(teacherId, classId) {
  if(classId) {
    firebase.database().ref('classes/' + classId + '/teachers/' + teacherId).remove();
  } else {
    for(i in data.classes) {
      firebase.database().ref('classes/' + i + '/teachers/' + teacherId).remove();
    }
  }

}

function removeTeacherChipFromClass(e) {
  e = e.parentNode;
  let teacherId = e.getAttribute("teacherId");
  let classId = document.getElementById("classDetail").getAttribute("classId");
  removeTeacherFromClass(teacherId, classId);
  e.parentNode.removeChild(e);
}

/***********************************
Autocomplete Functions
***********************************/
$('.facultyAutoComplete').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback) {
          qry = qry.toLowerCase();
          let list = [];
          for(id in data.faculty) {
            let li = data.faculty[id];
            let name = li.first_name + " " + li.last_name;
            console.log(li, name);
            if(name.toLowerCase().indexOf(qry) == 0) {
              list.push(li.name);
            }
          }
          callback(list);
        }
    }
});

$('.studentsAutoComplete').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback) {
          qry = qry.toLowerCase();
          let list = [];
          for(id in data.students) {
            let li = data.students[id];
            let name = li.first_name + " " + li.last_name;
            if(name.toLowerCase().indexOf(qry) == 0) {
              list.push(name + " (ID# " + id + ")");
            }
          }
          callback(list);
        }
    }
});

$('.classesAutoComplete').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback) {
          qry = qry.toLowerCase();
          let list = [];
          for(i in data.classes) {
            let li = data.classes[i];
            if(li.name.toLowerCase().indexOf(qry) == 0) {
              list.push(li.name);
            }
          }
          callback(list);
        }
    }
});


/***********************************
Utility Functions
***********************************/


//Returns true if it is a DOM node
function isNode(o){
  return (
    typeof Node === "object" ? o instanceof Node : 
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
  );
}

//Returns true if it is a DOM element    
function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
}

function getId(type, name) {
  for(i in data[type]) {
    if(data[type][i].name == name) return i;
  }
}

function getMonthString(month) {
  if(month == 0) {
    return "January"
  } else if(month == 1) {
    return "February"
  } else if(month == 2) {
    return "March"
  } else if(month == 3) {
    return "April"
  } else if(month == 4) {
    return "May"
  } else if(month == 5) {
    return "June"
  } else if(month == 6) {
    return "July"
  } else if(month == 7) {
    return "August"
  } else if(month == 8) {
    return "September"
  } else if(month == 9) {
    return "October"
  } else if(month == 10) {
    return "November"
  } else if(month == 11) {
    return "December"
  } else {
    return "Error"
  } 
}

function getDayString(day) {
  if(day == 0) {
    return "Sunday"
  } else if(day == 1) {
    return "Monday"
  } else if(day == 2) {
    return "Tuesday"
  } else if(day == 3) {
    return "Wednesday"
  } else if(day == 4) {
    return "Thursday"
  } else if(day == 5) {
    return "Friday"
  } else if(day == 6) {
    return "Saturday"
  } else {
    return "Error"
  } 
}