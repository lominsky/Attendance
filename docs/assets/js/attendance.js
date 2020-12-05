let students = [];
let date;

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

	// ********** Handle Student List **********
	firebase.database().ref("classes/" + search.id).once("value", snapshot => {
		data = snapshot.val();
		if(data == null) {
			document.location = "/";
		}
		if(!data.days[date.getDayString()]) return false;
		$("#name").text(data.name);
		for(let uid in data.students) {
			firebase.database().ref("students/" + uid).once("value", snapshot => {
				students.push(snapshot.val());
				assembleList();
			})
		}
		getAttendance();
	})
}

function assembleList() {
	students = students.sort((a, b) => {
		if(a.first_name > b.first_name) return 1;
		if(a.first_name < b.first_name) return -1;
		if(a.last_name > b.last_name) return 1;
		if(a.last_name < b.last_name) return -1;
		return 0;
	})

	$("#students").html("");
	for(let s of students) {
		let li = $("<li class='list-group-item container' student-id='" + s.id + "'></li>");

		let name = $('<span class="row mb-3 ml-1 mr-1 student-name">' + s.first_name + " " + s.last_name + '</span>')
		
		let buttons = $('<span class="row ml-1 mr-1 mb-3"></span>');
		let buttonGroup = $('<div class="btn-group btn-group-toggle"></div>');
		let present = $('<label class="btn btn-outline-success" status="Present">Present<input type="radio" status="Present" onclick="takeAttendance(this)"></label>');
		let late = $('<label class="btn btn-outline-warning" status="Late">Late<input type="radio" status="Late" onclick="takeAttendance(this)"></label>');
		let absent = $('<label class="btn btn-outline-danger" status="Absent">Absent<input type="radio" status="Absent" onclick="takeAttendance(this)"></label>');
		buttonGroup.append(present, late, absent);
		buttons.append(buttonGroup);

		let note = $("<span class='row ml-1 mr-1'><span class='input-group'><span class='input-group-text'>Notes</span><input type='text' class='form-control' onblur='takeAttendance(this)'></span></span>");
		li.append(name, buttons, note);
		$("#students").append(li);
	}
}


function setAll(status) {
	let rows = $(".list-group-item").each((i, v) => {
		let note = $(v).find('input.form-control');
		note = $(note).val();

		let id = $(v).attr("student-id");
		updateAttendance(date.toNumberString(), search.id, id, status, note);

		$(v).find("[type='radio']").each((j, val) => {
			val = $(val);

			if(val.attr("status") == status)
				val.parent().addClass("active");
			else
				val.parent().removeClass("active");
		});
	});
}

function takeAttendance(e) {
	let target = $(e);
	let li = target.closest("li");

	if(target.is("[type='radio']")) {
		let s = target.attr("status");
		li.find("[type='radio']").each((i, val) => {
			val = $(val);

			if(val.attr("status") == s)
				val.parent().addClass("active");
			else
				val.parent().removeClass("active");
		});
	}

	let status = (li.find(".active").attr("status"));
	if(status == null) status = "Not Taken";
	let note = li.find("[type='text']").val();
	let studentId = li.attr("student-id");

	updateAttendance(date.toNumberString(), search.id, studentId, status, note);
}

function getAttendance() {
	firebase.database().ref("attendance/byClass/" + search.id + "/" + date.toNumberString()).once("value", snapshot => {
		let att = snapshot.val();
		if(att == null) {
			let today = new Date();
			if(today.toNumberString() != date.toNumberString()) {
				return false;
			}
			if(!data.days[date.getDayString()]) {
				return false;
			}
			for(let studentId in data.students) {
				if(data.students[studentId] == null) continue;
				updateAttendance(date.toNumberString(), data.id, studentId);
			}
			return false;
		}

		for(let id in att) {
			let li = $("[student-id='" + id + "']");

			li.find("[type='radio']").each((i, val) => {
				val = $(val);
				if(val.attr("status") == att[id].status)
					val.parent().addClass("active");
				else
					val.parent().removeClass("active");
			});


			li.find("[type='text']").val(att[id].note);
		}
	});
}