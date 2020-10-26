function prepPage() {
	addNavigation();

	getGlobalData("teachers");
	getGlobalData("students");
	firebase.database().ref("/classes/" + search.id).once('value', function(snapshot) {
		let temp = snapshot.val();
		if(temp == null) {
			document.location = "classes.html";
		}
		data = temp;

		if(data.students == null) data.students = {};
		let tempStudents = {};
		for(let i in data.students) {
			if(data.students != null)
				tempStudents[i] = true;
		}
		data.students = tempStudents;

		if(data.teachers == null) data.teachers = {};
		let tempTeachers = {};
		for(let i in data.teachers) {
			if(data.teachers != null)
				tempTeachers[i] = true;
		}
		data.teachers = tempTeachers;

		fillPage();
    getAttendance();
	});
}

function fillPage() {
	$("#detailName").text(data.name);
  document.title = "Attendance - " + data.name;
	for(let day in data.days) {
		let meets = data.days[day];
		$("#" + day + "CheckBox").prop("checked", meets);
		$("#" + day + "CheckBox").change(function(e) {
			let t = $(e.target);
			firebase.database().ref(/classes/ + data.id + "/days/" + day).set(t.prop("checked"));
		});
	}

	let types = ["student", "teacher"];
	for(let type of types) {
		$("#" + type + "List").html("")
    let people = [];
    for(let i of Object.keys(data[type + "s"])) {
      people.push(globalData[type + "s"][i]);
   }       
    people = people.sort((a, b) => {
      if(a.last_name > b.last_name) return 1;
      if(a.last_name < b.last_name) return -1;
      if(a.first_name > b.first_name) return 1;
      if(a.first_name < b.first_name) return -1;
      return 0;
    })
    for(let p of people) {
      let name = p.first_name + " " + p.last_name;
      $("#" + type + "List").append($('<li class="list-group-item"><span class="' + type + 'List" ' + type + '-id="' + p.id + '" student-name="' + name + '" onclick="document.location=\'' + type + '.html?id=' + p.id + '\'">' + name + '</span><span class="admin-only" style="float:right;" onclick="removePerson(\'' + type + '\', ' + p.id + ')"><span data-feather="x"></span></span></li>'));
    }
	}

  	feather.replace();
}

$("#addTeacherToClassInput").keyup(e => {
  if(e.key == "Enter") {
  	let userId = $(e.target).val();
    if(userId.indexOf(',') == -1) {
    	userId = userId.substring(userId.indexOf("ID# ") + 4);
    	if(globalData.teachers[userId] == null) return false;
    	if(data.teachers[userId] != null) return false;
    	addPersonToClass("teacher", data.id, data.name, userId, globalData.teachers[userId].first_name + " " + globalData.teachers[userId].last_name)
    	data.teachers[userId] = globalData.teachers[userId].first_name + " " + globalData.teachers[userId].last_name;
    	fillPage();
      $(e.target).val("");
    } else {
      let userIds = userId.split(",");
      for(let id of userIds) {
        id = parseInt(id.trim());
        if(globalData.teachers[id] == null) continue;
        if(data.teachers[id] != null) continue;
        addPersonToClass("teacher", data.id, data.name, id, globalData.teachers[id].first_name + " " + globalData.teachers[id].last_name)
        data.teachers[id] = globalData.teachers[id].first_name + " " + globalData.teachers[id].last_name;
        fillPage();
        $(e.target).val("");
      }
    }
  }
})
$('.teacherAutoComplete').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback) {
          qry = qry.toLowerCase();
          let list = [];
          for(let i in globalData.teachers) {
            let li = globalData.teachers[i];
            let name = li.first_name + " " + li.last_name + " - ID# " + li.id;
            if(name.toLowerCase().indexOf(qry) == -1) continue;
            if(data.teachers[li.id] != null) continue;
            list.push(name);
          }
          callback(list);
        }
    }
});

$("#addStudentToClassInput").keyup(e => {
  if(e.key == "Enter") {
  	let userId = $(e.target).val();
    if(userId.indexOf(',') == -1) {
    	userId = userId.substring(userId.indexOf("ID# ") + 4);
    	if(globalData.students[userId] == null) return false;
    	if(data.students[userId] != null) return false;
    	addPersonToClass("student", data.id, data.name, userId, globalData.students[userId].first_name + " " + globalData.students[userId].last_name);
    	data.students[userId] = globalData.students[userId].first_name + " " + globalData.students[userId].last_name;
    	fillPage();
      $(e.target).val("");
    } else {
      userIds = userId.split(",");
      for(let id of userIds) {
        id = parseInt(id.trim());
        if(globalData.students[id] == null) continue;
        if(data.students[id] != null) continue;
        addPersonToClass("student", data.id, data.name, id, globalData.students[id].first_name + " " + globalData.students[id].last_name)
        data.students[id] = globalData.students[id].first_name + " " + globalData.students[id].last_name;
        fillPage();
        $(e.target).val("");
      }
    }
  }
})
$('.studentAutoComplete').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback) {
          qry = qry.toLowerCase();
          let list = [];
          for(let i in globalData.students) {
            let li = globalData.students[i];
            let name = li.first_name + " " + li.last_name + " - ID# " + li.id;
            if(name.toLowerCase().indexOf(qry) == -1) continue;
            if(data.students[li.id] != null) continue;
            list.push(name);
          }
          callback(list);
        }
    }
});

function removePerson(type, id) {
	let result = confirm("Are you sure you want to remove " + globalData[type + "s"][id].first_name + " from this class?");
	if(result) {
  		removePersonFromClass(type, data.id, id);
  		delete data[type + "s"][id];
	}

	fillPage();
}

function getAttendance() {
  firebase.database().ref('attendance/byClass/' + data.id).once('value', snapshot => {
    let att = snapshot.val();
    let days = [];
    let students = {};

    for(let d in att) {
      let date = new Date(d);
      date = new Date(date.getTime() + 12*60*60*1000);
      let day = {
        date: date,
        roster: []
      }
      for(let studentId in att[d]) {
        if(att[d][studentId] == null) continue;
        day.roster.push({
          id: studentId,
          first_name: globalData.students[studentId].first_name,
          last_name: globalData.students[studentId].last_name,
          status: att[d][studentId].status,
          note: att[d][studentId].note
        });
        if(students[studentId] == null) {
          students[studentId] = {
            Present: 0,
            Late: 0,
            Absent: 0,
            "Not Taken": 0
          }
        }
        students[studentId][att[d][studentId].status]++;
      }
      days.push(day);
    }
    for(let s in students) {
      let entry = $("[student-id='" + s + "'");
      //Not taken: , <span class='Not-Taken'>" + students[s]["Not Taken"] + "</span>
      let stats = " (<span class='Present'>" + students[s].Present + "</span>, <span class='Late'>" + students[s].Late + "</span>, <span class='Absent'>" + students[s].Absent + "</span>)";
      entry.html(entry.attr("student-name") + stats);
    }
    for(let d of days) {
      let li = $('<li class="list-group-item"></li>');
      let p = "attendance.html?date=" + d.date.toNumberString() + "&id=" + search.id;
      let title = $("<h6 onclick='document.location=\"" + p + "\"'>" + d.date.toTextString() + "</h6>")
      let ul = $("<ul></ul");
      d.roster = d.roster.sort((a, b) => {
        if(a.last_name > b.last_name) return 1;
        if(a.last_name < b.last_name) return -1;
        if(a.first_name > b.first_name) return 1;
        if(a.first_name < b.first_name) return -1;
        return 0;
      })
      for(let s of d.roster) {
        let li = $("<li><span class='" + s.status + "'>" + s.first_name + " " + s.last_name + "</span></li>");
        if(s.note != null && s.note != "") {
          li.append(" (" + s.note + ")");
        }
        ul.append(li);
      }

      li.append(title, ul);
      $("#attendanceList").prepend(li);
    }
  })
}