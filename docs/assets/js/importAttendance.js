function prepPage() {
	console.log("Ready");
}

function importAttendance() {
	let csv = $('#csv').val();
	let data = csv.split('\n');
	for(r in data) {
		data[r] = data[r].split(',');
		if(r == 0) {
			for(c in data[r]) {
				let val = parseInt(data[r][c]);
				if(!Number.isInteger(val)) {
					return alert("Error: Row 0, Column " + c + " is not an integer.");
				}
			}
		} else {
			let day = new Date(data[r][0]);
			if(day == "Invalid Date") {
				return alert("Error: Invalid date in row " + r);
			}
			data[r][0] = day.toNumberString();
			for(let c = 1; c < data[r].length; c++) {
				let statuses = {
					"Present": true,
					"Late": true,
					"Absent": true
				}
				if(statuses[data[r][c]] == null) {
					data[r][c] = "Not Taken";
				}
			}
		}
	}
	// console.log(data);
	for(let r = 1; r < data.length; r++) {
		for(c = 1; c < data[r].length; c++) {
			updateAttendance(data[r][0], data[0][0], data[0][c], data[r][c]);
		}
	}
}