function prepPage() {
	addNavigation();
	firebase.database().ref("/students/").once('value', snapshot => {
		data = snapshot.val();
		data = data.filter(el => el != null);
		for(let d of data) {
			d.Present = 0;
			d.Late = 0;
			d.Absent = 0;
			d["Not Taken"] = 0;
		}
		sortData(data, fillTable);
		getAttendance();
	}, error => {
		console.log(error);
	});
	$("input").keyup(e => {
		if(e.keyCode == 13) {
			addEntry();
		}
	});

	$("th").click(resort);
}


function fillTable(array) {
	let table = $("tbody");
	table.html("");
	for(let row of array) {
		let tr = $("<tr student-id='" + row.id + "' onclick='document.location=\"student.html?id=" + row.id +"\"'></tr>");
		tr.append($("<td></td>").text(row.id));
		tr.append($("<td></td>").text(row.first_name));
		tr.append($("<td></td>").text(row.last_name));
		tr.append($("<td status='Absent'></td>").text(row.Absent));
		tr.append($("<td status='Late'></td>").text(row.Late));
		table.append(tr);
	}
}

function getAttendance() {
	firebase.database().ref("attendance/byStudent").once('value', snapshot => {
		let attendance = snapshot.val();
		for(let sid in attendance) {
			if(attendance[sid] == null) continue;
			let classAttendance = attendance[sid];
			let att = {
				Present: 0,
				Late: 0,
				Absent: 0,
				"Not Taken": 0
			}
			for(let c in classAttendance) {
				if(classAttendance[c] == null) continue;
				for(let d in classAttendance[c]) {
					if(classAttendance[c][d] == null) continue;
					att[classAttendance[c][d].status]++;
				}
			}
			let el = data.find(element => element.id == sid);
			el.Present = att.Present;
			el.Late = att.Late;
			el.Absent = att.Absent;
			el["Not Taken"] = att["Not Taken"];
			let row = $('[student-id="' + sid + '"');
			$(row.find($('[status="Absent"'))).text(att.Absent);
			$(row.find($('[status="Late"'))).text(att.Late);
		}
	})
}

function addEntry() {
	let input = $("form");

	let entry = {}

	for(let inp of input[0]) {
		let i = $(inp);
		entry[i.attr("aria-label")] = i.val();
		if(i.val() == "") {
			return alert("Make sure to fill every field.");
		}
	}

	for(let i of data) {
		if(i.id == entry.id) {
			return alert("Please enter a unique ID.");
		}
	}

	for(let inp of input[0]) {
		$(inp).val("");
	}

	firebase.database().ref("/students/" + entry.id).set(entry);
	log("Student Added", JSON.stringify(entry));
	data.push(entry);
	sortData(data, fillTable);
	input[0][0].focus();
}

function addCSV() {
	let input = $("#students-csv-textarea");
	input = input.val().trim();

	//Split the input up, check for correct number of values
	input = input.split("\n");
	for(let row in input) {
		input[row] = input[row].split(",");
		if(input[row].length != 3) return alert("CSV error on line " + row + ". Must have 3 values.");
		for(let data in input[row]) {
			input[row][data] = input[row][data].trim();
			if(input[row][data].length == 0) return alert("CSV error on line " + row + ". Empty value.");
		}
		input[row][0] = parseInt(input[row][0]);
		if(!Number.isInteger(input[row][0])) return alert("CSV error on line " + row + ". ID must be an integer.");
	}

	//Check unique IDs
	for(let r = 0; r < input.length; r++) {
		let row = input[r];
		let id = parseInt(row[0]);
		for(let d of data)
			if(parseInt(d.id) == id) return alert("CSV error on line " + r + ". ID in DB.");
		for(let r2 = r + 1; r2 < input.length; r2++) {
			if(parseInt(input[r2][0]) == id) return alert("CSV error on lines " + r + " and " + r2 + ". Duplicate ID.");
		}
	}

	let entries = [];
	for(let row of input) {
		entries.push({
			id: row[0],
			first_name: row[1],
			last_name: row[2]
		})
	}
	//Add
	for(let entry of entries) {
		firebase.database().ref("/students/" + entry.id).set(entry);
		log("Student Added", JSON.stringify(entry));
		data.push(entry);
	}
	sortData(data, fillTable);
	$("#students-csv-textarea").val("");
}