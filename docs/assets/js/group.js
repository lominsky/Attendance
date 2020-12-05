function prepPage() {
	addNavigation();

  getGlobalData("students");
	firebase.database().ref("/groups/" + search.id).once('value', function(snapshot) {
		let temp = snapshot.val();
		if(temp == null) {
			document.location = "groups.html";
		}
		data = temp;

		if(data.students == null) data.students = {};
		let tempStudents = {};
		for(let i in data.students) {
			if(data.students != null)
				tempStudents[i] = true;
		}
		data.students = tempStudents;

    temp = {};
    globalData.classes = {};

    $("#classList").html("");
    for(let i in data.classes) {
      if(data.classes[i] != null) {
        temp[i] = true;
        firebase.database().ref("/classes/" + i).once("value", snapshot => {
          let c = snapshot.val();
          globalData.classes[i] = c;
          $("#classList").append($('<li class="list-group-item"><span class-id="' + i + '" class-name="' + c.name + '" onclick="document.location=\'class.html?id=' + i + '\'">' + c.name + ' </span><span style="float:right;" onclick="removeClass(' + i + ')"><span data-feather="x"></span></span></li>'));
          feather.replace();
        })
      }
    }
    data.classes = temp;
    getGlobalData("classes");

		fillPage();
	});
}

function fillPage() {
	$("#detailName").text(data.name);
  document.title = "Attendance - " + data.name;

	let types = ["student"];
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
      $("#" + type + "List").append($('<li class="list-group-item"><span class="' + type + 'List" ' + type + '-id="' + p.id + '" student-name="' + name + '" onclick="document.location=\'' + type + '.html?id=' + p.id + '\'">' + name + '</span><span class="admin-only" style="float:right;" onclick="removeStudent(' + p.id + ')"><span data-feather="x"></span></span></li>'));
    }
	}

  	feather.replace();
}

function listClasses() {
    $("#classList").html("");
    for(let i in data.classes) {
      let c = globalData.classes[i];
      $("#classList").append($('<li class="list-group-item"><span class-id="' + i + '" class-name="' + c.name + '" onclick="document.location=\'class.html?id=' + i + '\'">' + c.name + '</span><span style="float:right;" onclick="removeClass(' + i + ')"><span data-feather="x"></span></span></li>'));    
    }
    feather.replace();
}

$("#addStudentToClassInput").keyup(e => {
  if(e.key == "Enter") {
  	let userId = $(e.target).val();
    if(userId.indexOf(',') == -1) {
    	userId = userId.substring(userId.indexOf("ID# ") + 4);
    	if(globalData.students[userId] == null) return false;
    	if(data.students[userId] != null) return false;
      for(let cid in data.classes) {
        addStudentToClass(cid, globalData.classes[cid].name, userId, globalData.students[userId].first_name + " " + globalData.students[userId].last_name);
      }
    	addStudentToGroup(data.id, data.name, userId, globalData.students[userId].first_name + " " + globalData.students[userId].last_name);
    	data.students[userId] = globalData.students[userId].first_name + " " + globalData.students[userId].last_name;
    	fillPage();
      $(e.target).val("");
    } else {
      userIds = userId.split(",");
      for(let id of userIds) {
        id = parseInt(id.trim());
        if(globalData.students[id] == null) continue;
        if(data.students[id] != null) continue;
        for(let cid in data.classes) {
          console.log(userId, globalData.students);
          addStudentToClass(cid, globalData.classes[cid].name, id, globalData.students[id].first_name + " " + globalData.students[id].last_name);
        }
        addStudentToGroup(data.id, data.name, id, globalData.students[id].first_name + " " + globalData.students[id].last_name)
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

$("#addGroupToClassInput").keyup(e => {
  if(e.key == "Enter") {
    let cid = $(e.target).val();
    if(cid.indexOf(',') == -1) {
      cid = cid.substring(cid.indexOf("ID# ") + 4);
      if(globalData.classes[cid] == null) return false;
      if(data.classes[cid] != null) return false;
      for(let uid in data.students) {
        addStudentToClass(cid, globalData.classes[cid].name, uid, globalData.students[uid].first_name + " " + globalData.students[uid].last_name);
      }
      addGroupToClass(cid, globalData.classes[cid].name, data.id, data.name);
      data.classes[cid] = globalData.classes[cid].name;
      fillPage();
      $(e.target).val("");
    }
  }
});
$('.classAutoComplete').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback) {
          qry = qry.toLowerCase();
          let list = [];
          console.log(globalData.classes);
          for(let i in globalData.classes) {
            let li = globalData.classes[i];
            let name = li.name + " - ID# " + li.id;
            if(name.toLowerCase().indexOf(qry) == -1) continue;
            if(data.classes[li.id] != null) continue;
            list.push(name);
          }
          callback(list);
        }
    }
});

function removeClass(classId) {
  let result = confirm("Are you sure you want to remove the group from from this class?");
  if(result) {
      for(let i in data.students) {
        if(data.students[i] == null) continue;
        removeStudentFromClass(classId, i);
      }
      removeGroupFromClass(classId, data.id);
      delete data.classes[classId];
      listClasses();
  }
}


function removeStudent(id) {
  let result = confirm("Are you sure you want to remove " + globalData.students[id].first_name + " from this group?");
  if(result) {
      for(let cid in data.classes) {
        removeStudentFromClass(cid, id)
      }
      removeStudentFromGroup(data.id, id);
      delete data.students[id];
  }

  fillPage();
}