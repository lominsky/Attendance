function prepPage() {
	addNavigation();
	sortBy.field = "id";
	firebase.database().ref("/groups/").once('value', function(snapshot) {
		data = snapshot.val();
		if(data == null) data = [];
		data = data.filter(el => el != null);
		sortData(data, fillTable);
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
		if(row == null) continue;
		let tr = $("<tr onclick='document.location=\"group.html?id=" + row.id +"\"'></tr>");
		tr.append($("<td></td>").text(row.id));
		tr.append($("<td></td>").text(row.name));
		table.append(tr);
	}
}

function addEntry() {
	let input = $("form");

	let entry = {
  }

	for(let inp of input[0]) {
		let i = $(inp);
		entry[i.attr("aria-label")] = i.val();
		if(i.val() == "") {
			return alert("Make sure to fill every field.");
		}
	}
	for(let i of data) {
		if(i == null) continue;
		if(i.id == entry.id) {
			return alert("Please enter a unique ID.");
		}
	}

	for(let inp of input[0]) {
		$(inp).val("");
	}

	firebase.database().ref("/groups/" + entry.id).set(entry);
	log("Group Added", JSON.stringify(entry));
	data.push(entry);
	sortData(data, fillTable);
	input[0][0].focus();
}


function addCSV() {
	let input = $("#groups-csv-textarea");
	input = input.val().trim();

	//Split the input up, check for correct number of values
	input = input.split("\n");
	for(let row in input) {
		input[row] = input[row].split(",");
		if(input[row].length != 2) return alert("CSV error on line " + row + ". Must have 2 values.");
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
			name: row[1]
		})
	}
	//Add
	for(let entry of entries) {
		firebase.database().ref("/groups/" + entry.id).set(entry);
		log("Group Added", JSON.stringify(entry));
		data.push(entry);
	}
	sortData(data, fillTable);
	$("#groups-csv-textarea").val("");
}