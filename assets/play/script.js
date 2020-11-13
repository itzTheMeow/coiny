let ver = "1.2.6";
let verData =
  "\n- Added shortened numbers\n- Added number shortness changer value";

let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
  navigator.userAgent
);

if (mobile)
  document.getElementById("indicator").src =
    "https://img.icons8.com/metro/19/000000/smartphone-tablet.png";
if (!mobile)
  document.getElementById("indicator").src =
    "https://img.icons8.com/color/19/000000/monitor.png";
if (mobile)
  document.getElementById("indicator").title = "You are a mobile user.";
if (!mobile) document.getElementById("indicator").title = "You are a PC user.";

let game = browserStorage.getItem("game");
let tempGame = {
  coins: 0,
  fastPoints: 0,
  structures: { farms: 0, factories: 0 },
  CPS: 0,
  version: "unknown",
  structureData: {
    farms: { price: 10, CPS: 1, increase: 1.05 },
    factories: { price: 100, CPS: 2, increase: 1.08 }
  },
  fastPointInterval: 15,
  secondsPerFP: 3,
  CPC: 1,
  maxCursorSpeed: 2,
  shortNumbers: "abbreviated"
};

if (!game) game = tempGame;

let fastInterval;

Number.prototype.toCoinyString = function() {
  let number = this;

  if (game.shortNumbers == "abbreviated") {
    let decPlaces = 3;

    decPlaces = Math.pow(10, decPlaces);

    var abbrevs = ["k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d", "d+"];

    for (var i = abbrevs.length - 1; i >= 0; i--) {
      var size = Math.pow(10, (i + 1) * 3);
      if (size <= number) {
        number = Math.round((number * decPlaces) / size) / decPlaces;
        if (number == 1000 && i < abbrevs.length - 1) {
          number = 1;
          i++;
        }
        number += abbrevs[i];
        break;
      }
    }
    return number;
  } else if (game.shortNumbers == "locale") {
    return number.toLocaleString();
  } else {
    return number;
  }
};

if (game.shortNumbers == "abbreviated") {
  document.getElementById("slider").value = 1;
} else if (game.shortNumbers == "locale") {
  document.getElementById("slider").value = 2;
} else {
  document.getElementById("slider").value = 3;
}

function refresh(lo) {
  game = browserStorage.getItem("game");
  if (!game) game = tempGame;

  if (game.version !== ver) {
    let v = game.version;
    game = tempGame;
    clearInterval(fastInterval);
    tempGame.version = ver;

    if (game.version !== "unknown")
      alert(
        `Your game is running version ${v}, it will be updated to the latest one: ${ver}... Your game data will be cleared, sorry for the inconvenience.\n\nNotes: ${verData}`
      );
    game.version = ver;
    window.location.reload();
    return;
  }

  if (!lo)
    document.getElementById("title").innerHTML =
      game.coins.toCoinyString() + " Coins | Coiny";

  document.getElementById("coinCount").innerHTML = game.coins.toCoinyString();

  document.getElementById(
    "fastPointCount"
  ).innerHTML = game.fastPoints.toCoinyString();

  document.getElementById("CPSCount").innerHTML = game.CPS.toCoinyString();

  document.getElementById(
    "farmCount"
  ).innerHTML = game.structures.farms.toCoinyString();

  if (game.coins >= game.structureData.farms.price) {
    document.getElementById("farmButton").removeAttribute("disabled");
  } else {
    document.getElementById("farmButton").setAttribute("disabled", "");
  }

  document.getElementById(
    "farmPrice"
  ).innerHTML = game.structureData.farms.price.toCoinyString();

  if (game.fastPoints >= game.fastPointInterval && game.CPS > 0) {
    document.getElementById("useFP").removeAttribute("disabled");
  } else {
    document.getElementById("useFP").setAttribute("disabled", "");
  }

  let saveData = JSON.stringify(game);
  saveData = saveData.split("").join("$#CSO#$");
  browserStorage.setItem("saveData", saveData);

  document.getElementById(
    "factoryCount"
  ).innerHTML = game.structures.factories.toCoinyString();

  if (game.coins >= game.structureData.factories.price) {
    document.getElementById("factoryButton").removeAttribute("disabled");
  } else {
    document.getElementById("factoryButton").setAttribute("disabled", "");
  }

  document.getElementById(
    "factoryPrice"
  ).innerHTML = game.structureData.factories.price.toCoinyString();

  if (document.getElementById("slider").value == 1) {
    document.getElementById("sliderValue").innerHTML = "abbr.";
    game.shortNumbers = "abbreviated";
  } else if (document.getElementById("slider").value == 2) {
    document.getElementById("sliderValue").innerHTML = "locale";
    game.shortNumbers = "locale";
  } else {
    document.getElementById("sliderValue").innerHTML = "none";
    game.shortNumbers = "none";
  }

  document.getElementById("CPC").innerHTML = game.CPC;

  if (game.CPC > 1) document.getElementById("CPCplural").innerHTML = "s";

  let earned = 0;
  let str = game.structures;
  earned += str.farms * game.structureData.farms.CPS;
  earned += str.factories * game.structureData.factories.CPS;
  game.CPS = earned;

  document.getElementById("slider").max = 3;
}

refresh();

function editGame(key, value, operation) {
  if (operation == "set") game[key] = value;
  if (operation == "add") game[key] += value;
  if (operation == "subtract") game[key] -= value;
  if (operation == "merge") {
    for (var v in value) {
      game[key][v] = value[v];
    }
  }
  if (operation == "merge+") {
    for (var v in value) {
      game[key][v] += value[v];
    }
  }
  if (operation == "merge-") {
    for (var v in value) {
      game[key][v] -= value[v];
    }
  }

  browserStorage.setItem("game", game);

  let lo = false;
  if (key == "lastOnline") lo = true;

  refresh(lo);
}

function cooldown(cooldown, task) {
  let taskDone = game.lastOnline;
  if (taskDone !== null && cooldown - (Date.now() - taskDone) > 0) {
    /* If already done */
    return true;
  }
  return false;
}

function getFP() {
  if (!game.lastOnline) return;
  var secondsThen = game.lastOnline / 1000;
  var secondsNow = new Date().getTime() / 1000;

  let pointsEarned = Math.floor((secondsNow - secondsThen) / game.secondsPerFP);

  if (pointsEarned) {
    editGame("fastPoints", pointsEarned, "add");
    document.getElementById("fastPointEarnings").innerHTML = pointsEarned;
    document.getElementById("fpc").style.display = "block";
    setTimeout(function() {
      document.getElementById("fpc").style.display = "none";
    }, 5000);
  }
}
getFP();
fastInterval = setInterval(function() {
  editGame("lastOnline", Date.now(), "set");
}, 1);

function addCoins(c) {
  editGame("coins", c, "add");
}

function addStructure(structure, number) {
  let price = game.structureData[structure].price;

  price = price * number;

  let temp = {};
  temp[structure] = number;
  editGame("structures", temp, "merge+");
  editGame("coins", price, "subtract");

  temp = {};
  temp[structure] = game.structureData[structure];
  temp[structure].price = Math.ceil(
    game.structureData[structure].price * game.structureData[structure].increase
  );

  editGame("structureData", temp, "merge");
}

function reset() {
  game = tempGame;
}

function runPerSecond() {
  editGame("coins", game.CPS, "add");
}

setInterval(runPerSecond, 1000);

function useFP() {
  let FP = game.fastPoints;
  setInterval(function() {
    if (FP < game.fastPointInterval) return clearInterval(this);
    FP -= game.fastPointInterval;
    runPerSecond();
    editGame("fastPoints", FP, "set");
  }, game.fastPointInterval * 5);
}

function blink(element, ms, timeout) {
  let hidden = false;
  let int = setInterval(function() {
    if (hidden) {
      element.style.visibility = "visible";
      hidden = false;
      return;
    } else {
      element.style.visibility = "hidden";
      hidden = true;
      return;
    }
  }, ms);
  setTimeout(function() {
    clearInterval(int);
  }, timeout);
}

let buttons = [];
let tooltips = {};
let buttonElements = document.getElementsByTagName("button");
for (var i in buttonElements) {
  if (Number(i)) {
    if (buttonElements[i].attributes["coiny-data-buttontype"])
      buttons.push(buttonElements[i]);
    if (buttonElements[i].attributes["coiny-data-tooltip"])
      tooltips[buttonElements[i].id] =
        buttonElements[i].attributes["coiny-data-tooltip"];
  }
}

dragElement(document.getElementById("cursor"));

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

window.onload = () => {
  document.getElementById("loader").style.display = "none";
  document.getElementById("game").style.display = "block";
};

function tooltipCreate(e) {
  e = document.getElementById(e);
  e.style.display = "block";
}
function tooltipDelete(e) {
  e = document.getElementById(e);
  e.style.display = "none";
}

function hackerTools() {
  game.coins = Number(prompt("Coins?")) || 0
  game.structures.farms = Number(prompt("Farms?")) || 0
  game.structures.factories = Number(prompt("Factories?")) || 0
  game.fastPoints = Number(prompt("FastPoints?")) || 0
}