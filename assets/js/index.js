function prepPage() {
	addNavigation();

	// ********** Handle Date **********
	let date = getDateFromNumberString(search.date);
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
	}
	$("#date").text(date.toTextString() + " - " + date.getDayString());

	// ********** Get User's Classes **********
	firebase.database().ref("/teachers/").once('value', snapshot => {
		let teachers = snapshot.val();
		let email = user.email;
		if(search.email != null) email = search.email;
		let id = null;
		for(let t of teachers) {
			if(t == null) continue;
			if(t.email == email) id = t.id;
		}
		if(id == null) {
			log("Teacher email not found", "No teacher with the email address \"" + email + "\"");
			return alert("Error: Teacher email not found. Please seek support");
		}

		for(let c in teachers[id].classes) {
			if(c == null) continue;
			firebase.database().ref("classes/" + c).once("value", snapshot => {
				let _class = snapshot.val();
				if(_class.days[date.getDayString()]) {
					let el = $('<li class="list-group-item" onclick="document.location=\'attendance.html?date=' + date.toNumberString() + '&id=' + _class.id + '\'">' + _class.name + '</li>');
					_class.days.Homeroom ? $("#dailyList").append(el) : $("#classList").append(el);
				}
			});
		}
	});
}
