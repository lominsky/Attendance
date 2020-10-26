let date;
let daily = [];
let notTaken = [];

function prepPage() {
	addNavigation();

	// ********** Handle Date **********
	date = getDateFromNumberString(search.date);
	let now = new Date();
	if(date.toNumberString() == now.toNumberString()) $("#next-day").hide();
	if(date.getTime() > now.getTime()) {
		let path = location.pathname;
		delete search.date;
		let keys = Object.keys(search);
		let vals = Object.values(search);
		if(keys.length > 0) path += "?";
		for(let i in keys) {
			path += keys[i] + "=" + vals[i];
			if(i < keys.length -1) path += "&";
		}
		document.location = path;
	}
	$("#date").text(date.toTextString() + " - " + date.getDayString());
	if(date.getDay() % 6 == 0) return false;

	// ********** Get Data **********
	firebase.database().ref("attendance/byDate/" + date.toNumberString()).once("value", snapshot => {
		data.attendance = snapshot.val();
		if(data.attendance == null) data.attendance = {};
		firebase.database().ref("classes").once("value", snapshot => {
			data.classes = snapshot.val();
			firebase.database().ref("students").once("value", snapshot => {
				data.students = snapshot.val();
				firebase.database().ref("teachers").once("value", snapshot => {
					data.teachers = snapshot.val();
					propogateData();
				});
			});
		});
	});
	$("th").click(dailyResort);
}

function dailyResort(e) {
  let target = $(e.target);
  field = target.attr("field");
  if(sortBy.field == field) {
    sortBy.direction *= -1;
  } else {
    sortBy.field = field;
    sortBy.direction = 1;
  }
  sortData(daily, fillTable);
}

function propogateData() {
	daily = [];
	notTaken = [];
	for(let c of data.classes) {
		if(c == null) continue;
		if(!c.days[date.getDayString()]) continue;

		// *********** Handle Not Taken Attendance ************
		if(data.attendance[c.id] == null) {
			if((new Date()).toNumberString() == date.toNumberString()) {
				data.attendance[c.id] = {};
				for(sid in c.students) {
					updateAttendance(date.toNumberString(), c.id, sid);
					data.attendance[c.id][sid] = {status: "Not Taken"}
				}
			}
		}

		// *********** Get each students attendance ************
		if(!c.days.Homeroom) continue;
		let attendanceTaken = false;
		for(sid in c.students) {
			if(c.students[sid] == null) continue;
			let status = "Not Taken";
			let note = "";
			if(data.attendance[c.id] != null) {
				if(data.attendance[c.id][sid] == null) {
					data.attendance[c.id][sid] = {
						status: "Not Taken",
						note: ""
					}
				}
				status = data.attendance[c.id][sid].status;
				note = data.attendance[c.id][sid].note;
				if(note == null) note = "";
			}
			let s = {
				status: status,
				note: note,
				first_name: data.students[sid].first_name,
				last_name: data.students[sid].last_name,
				class_name: c.name,
				id: sid
			};
			if(s.status != "Not Taken" && s.status != null) attendanceTaken = true;
			daily.push(s);
		}
		if(!attendanceTaken) notTaken.push(c);
	}

	notTaken = notTaken.sort((a, b) => {
		if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
		if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
		return 0;
	});
	// console.log(notTaken);
	for(let c of notTaken) {
		let temp = $("<li class='list-group-item'></li>");
		let nameSpan = $("<span onclick='document.location=\"attendance.html?date=" + date.toNumberString() + "&id=" + c.id + "\"'>" + c.name + "</span>");
		if(c.days.Homeroom) nameSpan.prepend("Homeroom: ");
		temp.append(nameSpan);


		//  && (new Date()).toNumberString() == date.toNumberString()
		if(c.teachers.length > 0) {
			let addresses = "";
			for(let tid in c.teachers) {
				if(c.teachers[tid] == null) continue;
				addresses += data.teachers[tid].email + ",";
			}
			let email = "https://mail.google.com/mail/u/0/?view=cm&to=" + addresses + "&su=" + c.name + " Attendance&body=Hello,%0D%0A%0D%0APlease submit the attendance for " + c.name + " as soon as possible. You can submit it here: " + location.origin + "/attendance.html?id=" + c.id + "%0D%0A%0D%0AThank you!";
			let emailSpan = $('<span style=\'float:right\' onclick="window.open(\'' + email + '\', \'_blank\');"><span data-feather="mail"></span></span>');
			temp.append(emailSpan);
		}
	
		$("#notTakenList").append(temp);
	}

	// console.log(daily);
	// console.log(notTaken);
	// fillTable(daily);
	sortData(daily, fillTable);
	feather.replace();
}

function fillTable(array) {
	let table = $("tbody");
	table.html("");
	for(let row of array) {
		let tr = $("<tr onclick='document.location=\"student.html?id=" + row.id +"\"'></tr>");
		tr.append($("<td></td>").text(row.first_name));
		tr.append($("<td></td>").text(row.last_name));
		tr.append($("<td></td>").text(row.class_name));
		tr.append($("<td></td>").text(row.status));
		tr.append($("<td></td>").text(row.note));
		table.append(tr);
	}
}