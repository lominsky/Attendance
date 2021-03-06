var firebaseConfig = {
  apiKey: "AIzaSyCYH7blRN_i5uW3F5l1BWD_3I0uwZIQeUQ",
  authDomain: "attendance-tracker-adb41.firebaseapp.com",
  databaseURL: "https://attendance-tracker-adb41.firebaseio.com",
  projectId: "attendance-tracker-adb41",
  storageBucket: "attendance-tracker-adb41.appspot.com",
  messagingSenderId: "826609505931",
  appId: "1:826609505931:web:73af7efcac227f0d7a668e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let user = null;

var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
   prompt: 'select_account'
});

firebase.auth().onAuthStateChanged(function(u) {
  if (u) {
  	user = u;
  	getSearch();
  	user.isAdmin = false;
    $('.adminOnly').hide();
  	firebase.database().ref("adminTest").once("value", function(snapshot){
  		user.isAdmin = true;
  		$('.admin-only').show();
  	});

  	prepPage();
  	$('main').hide();
  	$('main.main').show();
  	$('.logout').show();
  } else {
  	user = null;
  	$('main').hide();
  	$('main.login').show();
  	let nav = $('#sidebarMenu').children()[0];
	nav = $(nav).children()[0];
	$(nav).html("");
  	$('.logout').hide();
  	// refresh();
  }
});

function login() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
	}, function(error) {
	  var email = error.email;
	  var credential = error.credential;
	  if (error.code === 'auth/account-exists-with-different-credential') {
	    auth.fetchSignInMethodsForEmail(email).then(function(providers) {
	    });
	  }
	});
}

function logout() {
	firebase.auth().signOut().then(function() {
	});	
}

function log(type, message) {
  let now = new Date();
	firebase.database().ref("logs/" + now.toNumberSlashString()).push({
		timestamp: firebase.database.ServerValue.TIMESTAMP,
		user: user.email,
		type: type,
		message: message
	}, error => {
  		if(error) {
  			console.log("LOGGING ERROR - oh the irony");
  			console.log(error);
  		}
  	})
}

function getGlobalData(path) {
	firebase.database().ref(path).once('value', snapshot => {
		let temp = snapshot.val();

		globalData[path] = {};
		for(let i in temp) {
			if(temp[i] != null) {
				globalData[path][i] = temp[i];
			}
		}
	});
}

function addPersonToClass(type, cid, className, uid, userName) {
	if(type == "student") {
		addStudentToClass(cid, className, uid, userName);
	} else if(type == "teacher") {
		addTeacherToClass(cid, className, uid, userName);
	}
}

function addStudentToClass(cid, className, uid, userName) {
  	firebase.database().ref('/classes/' + cid + "/students/" + uid).set(userName, error => {
  		if(error) {
  			console.log(error);
  			log("Error: addStudentToClass (1)", "Class ID: " + cid + ", User ID: " + uid);
  		}
  	});
  	firebase.database().ref('/students/' + uid + "/classes/" + cid).set(className, error => {
  		if(error) {
  			console.log(error);
  			log("Error: addStudentToClass (2)", "Class ID: " + cid + ", User ID: " + uid);
  		}
  	});
  	log("Student added to class", "Student #" + uid + " added to class #" + cid);
}

function addGroupToClass(cid, className, gid, groupName) {
    firebase.database().ref('/classes/' + cid + "/groups/" + gid).set(groupName, error => {
      if(error) {
        console.log(error);
        log("Error: addGroupToClass (1)", "Class ID: " + cid + ", Group ID: " + gid);
      }
    });
    firebase.database().ref('/groups/' + gid + "/classes/" + cid).set(className, error => {
      if(error) {
        console.log(error);
        log("Error: addGroupToClass (2)", "Class ID: " + cid + ", Group ID: " + gid);
      }
    });
    log("Group added to class", "Group #" + gid + " added to class #" + cid);
}

function addTeacherToClass(cid, className, uid, userName) {
  	firebase.database().ref('/classes/' + cid + "/teachers/" + uid).set(userName, error => {
  		if(error) {
  			console.log(error);
  			log("Error: addTeacherToClass (1)", "Class ID: " + cid + ", User ID: " + uid);
  		}
  	});
  	firebase.database().ref('/teachers/' + uid + "/classes/" + cid).set(className, error => {
  		if(error) {
  			console.log(error);
  			log("Error: addTeacherToClass (2)", "Class ID: " + cid + ", User ID: " + uid);
  		}
  	});
  	log("Teacher added to class", "Teacher #" + uid + " added to class #" + cid);
}

function addStudentToGroup(gid, groupName, uid, userName) {
    firebase.database().ref('/groups/' + gid + "/students/" + uid).set(userName, error => {
      if(error) {
        console.log(error);
        log("Error: addStudentToGroup (1)", "Group ID: " + gid + ", User ID: " + uid);
      }
    });
    firebase.database().ref('/students/' + uid + "/groups/" + gid).set(groupName, error => {
      if(error) {
        console.log(error);
        log("Error: addStudentToGroup (2)", "Group ID: " + gid + ", User ID: " + uid);
      }
    });
    log("Student added to group", "Student #" + uid + " added to group #" + gid);
}

function removePersonFromClass(type, cid, uid) {
  if(type == "student") {
    removeStudentFromClass(cid, uid);
  } else if(type == "teacher") {
    removeTeacherFromClass(cid, uid);
  }
}

function removeStudentFromClass(cid, uid) {
	firebase.database().ref('/students/' + uid + "/classes/" + cid).remove();
	firebase.database().ref('/classes/' + cid + "/students/" + uid).remove();
	log("Remove student from class", "Removed student #" + uid + " from class #" + cid);
}

function removeTeacherFromClass(cid, uid) {
	firebase.database().ref('/teachers/' + uid + "/classes/" + cid).remove();
	firebase.database().ref('/classes/' + cid + "/teachers/" + uid).remove();
	log("Remove teacher from class", "Removed teacher #" + uid + " from class #" + cid);
}

function removeGroupFromClass(cid, gid) {
  firebase.database().ref('/groups/' + gid + "/classes/" + cid).remove();
  firebase.database().ref('/classes/' + cid + "/groups/" + gid).remove();
  log("Remove group from class", "Removed group #" + gid + " from class #" + cid);
}

function removeStudentFromGroup(gid, uid) {
  firebase.database().ref('/groups/' + gid + "/students/" + uid).remove();
  firebase.database().ref('/students/' + uid + "/groups/" + gid).remove();
  log("Remove student from group", "Removed student #" + uid + " from group #" + gid);
}

function updateAttendance(date, classId, studentId, status = "Not Taken", note = "") {
	if(date == null || classId == null || studentId == null) {
		log("Error: takeAttendance", date + ", " + classId + ", " + studentId + ", " + status + ", " + note);
		console.log("Error: takeAttendance", date + ", " + classId + ", " + studentId + ", " + status + ", " + note);
		return false;
	}
	let val = {
		status: status,
		note: note
	}
	firebase.database().ref("attendance/byStudent/" + studentId + "/" + classId + "/" + date).set(val)
	firebase.database().ref("attendance/byClass/" + classId + "/" + date + "/" + studentId).set(val)
	firebase.database().ref("attendance/byDate/" + date + "/" + classId + "/" + studentId).set(val)
	log("Update Attendance", "Date: " + date + ", Class: " + classId + ", Student ID: " + studentId);
}