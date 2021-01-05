function prepPage() {
	addNavigation();

	firebase.database().ref("/students/" + search.id).once('value', function(snapshot) {
    data = snapshot.val();

    let temp = {};
    globalData.classes = {};
    globalData.groups = {};

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
    for(let i in data.groups) {
      // console.log(data.groups);
      if(data.groups[i] != null) {
        // console.log(i);
        firebase.database().ref("/groups/" + i).once("value", snapshot => {
          let g = snapshot.val();
          globalData.groups[i] = g;
          $("#groupList").append($('<li class="list-group-item"><span group-id="' + i + '" group-name="' + g.name + '" onclick="document.location=\'group.html?id=' + i + '\'">' + g.name + ' </span><span style="float:right;" onclick="removeGroup(' + i + ')"><span data-feather="x"></span></span></li>'));
          feather.replace();
        })
      }
    }
    data.classes = temp;
		fillPage();
    getAttendance();

    $('#note').change(function() {
      if($('#note').val().trim() == "") {
        firebase.database().ref('/students/' + data.id + '/note/').remove();
      } else {
        firebase.database().ref('/students/' + data.id + '/note/').set($('#note').val().trim());
      }
    })
	
  });
}

function fillPage() {
	$("#detailName").text(data.first_name + " " + data.last_name);
  if(data.note != null) {
    $("#note").val(data.note)
  }
  document.title = "Attendance - " + data.first_name + " " + data.last_name;
}

function listClasses() {
    $("#classList").html("");
    for(let i in data.classes) {
      let c = globalData.classes[i];
      $("#classList").append($('<li class="list-group-item"><span class-id="' + i + '" class-name="' + c.name + '" onclick="document.location=\'class.html?id=' + i + '\'">' + c.name + '</span><span style="float:right;" onclick="removeClass(' + i + ')"><span data-feather="x"></span></span></li>'));    
    }
    feather.replace();
}

function listGroups() {
    $("#groupList").html("");
    for(let i in data.groups) {
      let g = globalData.groups[i];
      $("#groupList").append($('<li class="list-group-item"><span group-id="' + i + '" group-name="' + g.name + '" onclick="document.location=\'group.html?id=' + i + '\'">' + g.name + '</span><span style="float:right;" onclick="removeGroup(' + i + ')"><span data-feather="x"></span></span></li>'));    
    }
    feather.replace();
}

function removeClass(id) {
  let result = confirm("Are you sure you want to remove this student from from this class?");
  if(result) {
      removeStudentFromClass(id, data.id);
      delete data.classes[id];
      listClasses();
  }
}

function removeGroup(gid) {
  let result = confirm("Are you sure you want to remove the student from from this group?");
  if(result) {
      removeStudentFromGroup(gid, data.id);
      delete data.groups[gid];
      listGroups();
  }
}

function getAttendance() {
  firebase.database().ref('attendance/byStudent/' + data.id).once('value', snapshot => {
    let att = snapshot.val();
    let days = {};
    let classes = {};

    for(let cid in att) {
      if(att[cid] == null) continue;

      if(classes[cid] == null) classes[cid] = {
        Present: 0,
        Late: 0,
        Absent: 0,
        "Not-Taken": 0
      };
      for(let d in att[cid]) {
        classes[cid][att[cid][d].status]++;

        if(days[d] == null) days[d] = {
          date: getDateFromNumberString(d),
          classes: []
        }

        // console.log(cid, globalData.classes);
        if(globalData.classes[cid] == null) continue;
        att[cid][d].name = globalData.classes[cid].name;
        days[d].classes.push(att[cid][d]);
      }
    }
    days = Object.values(days);
    days = days.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    })

    for(let c in classes) {
      if(classes[c] == null) continue;
      let entry = $("[class-id='" + c + "'");
      let stats = " (<span class='Present'>" + classes[c].Present + "</span>, <span class='Late'>" + classes[c].Late + "</span>, <span class='Absent'>" + classes[c].Absent + "</span>)";
      entry.html(entry.attr("class-name") + stats);
    }

    for(let d of days) {
      let li = $('<li class="list-group-item"></li>');
      let title = $("<h6>" + d.date.toTextString() + "</h6>")
      let ul = $("<ul></ul");
      d.classes = d.classes.sort((a, b) => {
        if(a.name > b.name) return 1;
        if(a.name < b.name) return -1;
        return 0;
      })
      for(let c of d.classes) {
        let li = $("<li><span class='" + c.status.replace(' ', '-') + "'>" + c.name + "</span></li>");
        if(c.note != null && c.note != "") {
          li.append(" (" + c.note + ")");
        }
        ul.append(li);
      }

      li.append(title, ul);
      $("#attendanceList").prepend(li);
    }
  }, error => {
    console.error(error);
  })
}