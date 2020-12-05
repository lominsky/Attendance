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
      path: "index.html",
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
      icon: "user-plus"
    },
    {
      name: "Classes",
      path: "classes.html",
      icon: "book"
    },
    {
      name: "Groups",
      path: "groups.html",
      icon: "users"
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

//https://github.com/js-cookie/js-cookie
/*! js-cookie v3.0.0-rc.1 | MIT */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self,function(){var n=e.Cookies,r=e.Cookies=t();r.noConflict=function(){return e.Cookies=n,r}}())}(this,function(){"use strict";function e(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}var t={read:function(e){return e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(e){return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}};return function n(r,o){function i(t,n,i){if("undefined"!=typeof document){"number"==typeof(i=e({},o,i)).expires&&(i.expires=new Date(Date.now()+864e5*i.expires)),i.expires&&(i.expires=i.expires.toUTCString()),t=encodeURIComponent(t).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),n=r.write(n,t);var c="";for(var u in i)i[u]&&(c+="; "+u,!0!==i[u]&&(c+="="+i[u].split(";")[0]));return document.cookie=t+"="+n+c}}return Object.create({set:i,get:function(e){if("undefined"!=typeof document&&(!arguments.length||e)){for(var n=document.cookie?document.cookie.split("; "):[],o={},i=0;i<n.length;i++){var c=n[i].split("="),u=c.slice(1).join("=");'"'===u[0]&&(u=u.slice(1,-1));try{var f=t.read(c[0]);if(o[f]=r.read(u,f),e===f)break}catch(e){}}return e?o[e]:o}},remove:function(t,n){i(t,"",e({},n,{expires:-1}))},withAttributes:function(t){return n(this.converter,e({},this.attributes,t))},withConverter:function(t){return n(e({},this.converter,t),this.attributes)}},{attributes:{value:Object.freeze(o)},converter:{value:Object.freeze(r)}})}(t,{path:"/"})});