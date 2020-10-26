function prepPage() {
	addNavigation();

	firebase.database().ref("/teachers/" + search.id).once('value', function(snapshot) {
    data = snapshot.val();

    let temp = {};
    globalData.classes = {};

    $("#classList").html("");
    for(let i in data.classes) {
      if(data.classes[i] != null) {
        temp[i] = data.classes[i];
        $("#classList").append($('<li class="list-group-item"><span onclick="document.location=\'class.html?id=' + i + '\'">' + temp[i] + '</span><span style="float:right;" onclick="removeClass(' + i + ')"><span data-feather="x"></span></span></li>'));
          
        // firebase.database().ref("/classes/" + i).once("value", snapshot => {
          // let c = snapshot.val();
          // globalData.classes[i] = c;
          // $("#classList").append($('<li class="list-group-item"><span onclick="document.location=\'class.html?id=' + i + '\'">' + c.name + '</span><span style="float:right;" onclick="removeClass(' + i + ')"><span data-feather="x"></span></span></li>'));
          // feather.replace();
        // })
      }
    }
    feather.replace();
    data.classes = temp;
		fillPage();
	});
}

function fillPage() {
	$("#detailName").text(data.first_name + " " + data.last_name);
  document.title = "Attendance - " + data.first_name + " " + data.last_name;
}

function listClasses() {
    $("#classList").html("");
    for(let i in data.classes) {
      let c = globalData.classes[i];
      $("#classList").append($('<li class="list-group-item"><span onclick="document.location=\'class.html?id=' + i + '\'">' + c.name + '</span><span style="float:right;" onclick="removeClass(' + i + ')"><span data-feather="x"></span></span></li>'));    
    }
    feather.replace();
}


function removeClass(id) {
	let result = confirm("Are you sure you want to remove this teacher from from this class?");
	if(result) {
  		removeTeacherFromClass(id, data.id);
  		delete data.classes[id];
      listClasses();
	}
}