function prepPage() {
	addNavigation();
	firebase.database().ref("/students/").once('value', snapshot => {
		data = snapshot.val();
		data = data.filter(el => el != null);
		sortData(data, fillTable);
	}, error => {
		console.log(error);
	});
	$("form").keyup(e => {
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
		let tr = $("<tr onclick='document.location=\"student.html?id=" + row.id +"\"'></tr>");
		tr.append($("<td></td>").text(row.id));
		tr.append($("<td></td>").text(row.first_name));
		tr.append($("<td></td>").text(row.last_name));
		table.append(tr);
	}
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