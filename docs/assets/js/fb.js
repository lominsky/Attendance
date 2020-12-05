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
	firebase.database().ref("logs").push({
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



// ********** NoTiFiCaTiOnS **********

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

// IDs of divs that display registration token UI or request permission UI.
const tokenDivId = 'token_div';
const permissionDivId = 'permission_div';

messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  // [START_EXCLUDE]
  // Update the UI to include the received message.
  appendMessage(payload);
  // [END_EXCLUDE]
});
// [END receive_message]

// [START get_token]
// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
//Update based on key from Settings -> Cloud Messaging -> Web Configuration
messaging.getToken({vapidKey: 'BBFFTEBdLe0bfirNjPW2v1NwNUiH86j3pXOAsT2DleSS4tlNfJ-awJ7Y_PEIhLBYMcrMvTAaWg7hsXH4A_M-dLY'}).then((currentToken) => {
  if (currentToken) {
    sendTokenToServer(currentToken);
    updateUIForPushEnabled(currentToken);
  } else {
    // Show permission request.
    console.log('No registration token available. Request permission to generate one.');
    // Show permission UI.
    updateUIForPushPermissionRequired();
    setTokenSentToServer(false);
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  showToken('Error retrieving registration token. ', err);
  setTokenSentToServer(false);
});
// [END get_token]


function showToken(currentToken) {
  // Show token in console and UI.
  console.log("showToken", currentToken);
  // const tokenElement = document.querySelector('#token');
  // tokenElement.textContent = currentToken;
}

// Send the registration token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer()) {
    console.log('Sending token to server...');
    // TODO(developer): Send the current token to your server.
    setTokenSentToServer(true);
  } else {
    console.log('Token already sent to server so won\'t send it again ' +
        'unless it changes');
  }

}

function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function showHideDiv(divId, show) {
  console.log("showHideDiv", divId, show);
  // const div = document.querySelector('#' + divId);
  // if (show) {
  //   div.style = 'display: visible';
  // } else {
  //   div.style = 'display: none';
  // }
}

function requestPermission() {
  console.log('Requesting permission...');
  // [START request_permission]
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve a registration token for use with FCM.
      // [START_EXCLUDE]
      // In many cases once an app has been granted notification permission,
      // it should update its UI reflecting this.
      resetUI();
      // [END_EXCLUDE]
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
  // [END request_permission]
}

function deleteToken() {
  // Delete registraion token.
  // [START delete_token]
  messaging.getToken().then((currentToken) => {
    messaging.deleteToken(currentToken).then(() => {
      console.log('Token deleted.');
      setTokenSentToServer(false);
      // [START_EXCLUDE]
      // Once token is deleted update UI.
      resetUI();
      // [END_EXCLUDE]
    }).catch((err) => {
      console.log('Unable to delete token. ', err);
    });
    // [END delete_token]
  }).catch((err) => {
    console.log('Error retrieving registration token. ', err);
    showToken('Error retrieving registration token. ', err);
  });

}

// Add a message to the messages element.
function appendMessage(payload) {
  const messagesElement = document.querySelector('#messages');
  const dataHeaderElement = document.createElement('h5');
  const dataElement = document.createElement('pre');
  dataElement.style = 'overflow-x:hidden;';
  dataHeaderElement.textContent = 'Received message:';
  dataElement.textContent = JSON.stringify(payload, null, 2);
  messagesElement.appendChild(dataHeaderElement);
  messagesElement.appendChild(dataElement);
}

// Clear the messages element of all children.
function clearMessages() {
  const messagesElement = document.querySelector('#messages');
  while (messagesElement.hasChildNodes()) {
    messagesElement.removeChild(messagesElement.lastChild);
  }
}

function updateUIForPushEnabled(currentToken) {
  showHideDiv(tokenDivId, true);
  showHideDiv(permissionDivId, false);
  showToken(currentToken);
}

function updateUIForPushPermissionRequired() {
  showHideDiv(tokenDivId, false);
  showHideDiv(permissionDivId, true);
}

messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  // ...
});

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: 'assets/img/c&c-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});