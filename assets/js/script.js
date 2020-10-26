var data = [];
var sortBy = {
  field: "last_name",
  direction: 1
};
var search = {};
let globalData = {};

function sortData(d, callback) {
  if(d == null) {
    d = [];
  }
  if(d.length <= 1) {
    return callback(d);
  }
  for(let i = d.length - 1; d >= 0; d--) {
    if(d[i] == null || d[i] == undefined) {
      d.splice(i, 1);
    }
  }
  d = d.sort((a, b) => {
    if(Number.isInteger(parseInt(a[sortBy.field]))) {
      if(parseInt(a[sortBy.field]) < parseInt(b[sortBy.field])) {
        return -1 * sortBy.direction;
      } else if (parseInt(a[sortBy.field]) > parseInt(b[sortBy.field])) {
        return 1 * sortBy.direction;
      } else {
        return 0;
      }
    }
    if(a[sortBy.field].toLowerCase() < b[sortBy.field].toLowerCase()) {
      return -1 * sortBy.direction;
    } else if (a[sortBy.field].toLowerCase() > b[sortBy.field].toLowerCase()) {
      return 1 * sortBy.direction;
    }
    return 0;
  });
  callback(d);
}

function resort(e, d = data) {
  let target = $(e.target);
  field = target.attr("field");
  if(sortBy.field == field) {
    sortBy.direction *= -1;
  } else {
    sortBy.field = field;
    sortBy.direction = 1;
  }
  sortData(data, fillTable);
}

function addNavigation() {
  let links = [
    {
      name: "Attendance",
      path: "/",
      icon: "calendar"
    },
    {
      name: "Daily Overview",
      path: "daily.html",
      icon: "bar-chart-2"
    },
    {
      name: "Students",
      path: "students.html",
      icon: "user"
    },
    {
      name: "Teachers",
      path: "teachers.html",
      icon: "users"
    },
    {
      name: "Classes",
      path: "classes.html",
      icon: "book"
    },
  ]
  let nav = $('#sidebarMenu').children()[0];
  nav = $(nav).children()[0];
  $(nav).html("");

  for(let link of links) {
    $(nav).append('<li class="nav-item"><a class="nav-link left-nav" href="' + link.path + '" rel="no-refresh"><span data-feather="' + link.icon + '"></span>' + link.name + '</a></li>');
  }

  feather.replace()
}

/***********************************
Autocomplete Functions
***********************************/
$('.classesAutoComplete').autoComplete({
    resolver: 'custom',
    events: {
        search: function (qry, callback) {
          qry = qry.toLowerCase();
          let list = [];
          for(i in data.classes) {
            let li = data.classes[i];
            if(li.name.toLowerCase().indexOf(qry) == 0) {
              list.push(li.name);
            }
          }
          callback(list);
        }
    }
});


/***********************************
Utility Functions
***********************************/

function getSearch() {
  let s = location.search;
  if(s.length < 2) return false;
  s = s.substring(1);

  s = s.split("&")
  for(let i in s) {
    let temp = s[i].split("=");
    search[temp[0]] = temp[1];
  }
}

Date.prototype.getMonthString = function() {
  let month = this.getMonth();
  if(month == 0) {
    return "January"
  } else if(month == 1) {
    return "February"
  } else if(month == 2) {
    return "March"
  } else if(month == 3) {
    return "April"
  } else if(month == 4) {
    return "May"
  } else if(month == 5) {
    return "June"
  } else if(month == 6) {
    return "July"
  } else if(month == 7) {
    return "August"
  } else if(month == 8) {
    return "September"
  } else if(month == 9) {
    return "October"
  } else if(month == 10) {
    return "November"
  } else if(month == 11) {
    return "December"
  } else {
    return "Error"
  } 
}

Date.prototype.getDayString = function() {
  let day = this.getDay();
  if(day == 0) {
    return "Sunday"
  } else if(day == 1) {
    return "Monday"
  } else if(day == 2) {
    return "Tuesday"
  } else if(day == 3) {
    return "Wednesday"
  } else if(day == 4) {
    return "Thursday"
  } else if(day == 5) {
    return "Friday"
  } else if(day == 6) {
    return "Saturday"
  } else {
    return "Error"
  } 
}

Date.prototype.toTextString = function() {
  return this.getMonthString() + " " + this.getDate() + ", " + this.getFullYear();
}

Date.prototype.toNumberString = function() {
  let year = this.getFullYear();
  let month = this.getMonth();
  month = month + 1;
  if(month < 10) month = "0" + month;
  let date = this.getDate();
  if(date < 10) date = "0" + date;
  return year + "-" + month + "-" + date;
}

function getDateFromNumberString(numberString) {
  let date = new Date(numberString);
  if(date == NaN) date = new Date();
  else if(date == "Invalid Date") date = new Date();
  else if(date == null) date = new Date();
  else date = new Date(date.getTime() + 12*60*60*1000);
  date.setHours(0, 0, 0);
  // console.log(date);
  return date;
}

function changeDate(direction) {
  let d = new Date(getDateFromNumberString(search.date).getTime() + 24*60*60*1000*direction);
  let path = location.pathname;
    search.date = d.toNumberString();
    let keys = Object.keys(search);
    let vals = Object.values(search);
    if(keys.length > 0) path += "?";
    for(let i in keys) {
      path += keys[i] + "=" + vals[i];
      if(i < keys.length -1) path += "&";
    }
    document.location = path;
    // console.log(path);
}