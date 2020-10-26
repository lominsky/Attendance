function prepPage() {
	addNavigation();
	sortBy.field = "id";
	firebase.database().ref("/classes/").once('value', function(snapshot) {
		data = snapshot.val();
		data = data.filter(el => el != null);
		sortData(data, fillTable);
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
		if(row == null) continue;
		let tr = $("<tr onclick='document.location=\"class.html?id=" + row.id +"\"'></tr>");
		tr.append($("<td></td>").text(row.id));
		tr.append($("<td></td>").text(row.name));
		table.append(tr);
	}
}

function addEntry() {
	let input = $("form");

	let entry = {
      days: {
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
        Sunday: false,
        Homeroom: false
      }
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

	firebase.database().ref("/classes/" + entry.id).set(entry);
	log("Class Added", JSON.stringify(entry));
	data.push(entry);
	sortData(data, fillTable);
	input[0][0].focus();
}