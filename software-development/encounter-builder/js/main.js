window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked;
    document.querySelector("#playercount").addEventListener('change', updateDifficulty);
    document.querySelector("#playerlevel").addEventListener('change', updateDifficulty);
};

let combatants = [];
let results = [];
let playercount = 4;
let playerlevel = 4;

let xpthresh = [
    [25, 50, 75, 100],
    [50, 100, 150, 200],
    [75, 150, 225, 400],
    [125, 250, 375, 500],
    [250, 500, 750, 1100],
    [300, 600, 900, 1400],
    [350, 750, 1100, 1700],
    [450, 900, 1400, 2100],
    [550, 1100, 1600, 2400],
    [600, 1200, 1900, 2800],
    [800, 1600, 2400, 3600],
    [1000, 2000, 3000, 4500],
    [1100, 2200, 3400, 5100],
    [1250, 2500, 3800, 5700],
    [1400, 2800, 4300, 6400],
    [1600, 3200, 4800, 7200],
    [2000, 3900, 5900, 8800],
    [2100, 4200, 6300, 9500],
    [2400, 4900, 7300, 10900],
    [2800, 5700, 8500, 12700]
];

let crxp = [ //fractional CRs are handled in the method
    10, //0
    200,
    450,
    700,
    1100,
    1800,
    2300,
    2900,
    3900,
    5000,
    5900, //10
    7200,
    8400,
    10000,
    11500,
    13000,
    15000,
    18000,
    20000,
    22000,
    25000, //20
    33000,
    41000,
    50000,
    62000,
    75000,
    90000,
    105000,
    120000,
    135000,
    155000 //30
];

function searchButtonClicked() {
    let url =  "https://api.open5e.com/monsters/?limit=200";

    //filters
    let searchterm = document.querySelector("#searchterm").value
    if(searchterm != "")
    {
        url += "&search=" + searchterm;
    }
    let cr = document.querySelector("#cr").value;
    if(cr != "")
    {
        url += "&challenge_rating=" + cr;
    }
    let type = document.querySelector("#type").value;
    if(type != "")
    {
        url += "&type=" + type;
    }
    let doc = document.querySelector("#doc").value;
    if(doc != "")
    {
        url += "&document__slug=" + doc;
    }
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.open("GET", url);
    xhr.send();
    document.querySelector("#searchresults").innerHTML = "searching...";
}

function dataLoaded(e) {
    xhr = e.target;

    let obj = JSON.parse(xhr.responseText);

    results = obj.results;

    let bigstring = "";
    for(let i = 0; i < results.length; i++)
    {
        bigstring += results[i].name + "   " + results[i].type + "   " + results[i].challenge_rating + "<button type='button' class='addresult' id='result" + i + "'>+</button><br>";
    }
    document.querySelector("#searchresults").innerHTML = "found " + obj.count + " monsters."
    document.querySelector("#monsters").innerHTML = bigstring;

    for(let i = 0; i < results.length; i++)
    {
        document.querySelector("#result" + i).onclick = addToCombat;
    }
}

//adds a monster to the combat
function addToCombat(e) {
    //get monster object from results
    let monster = results[parseInt(e.target.id.substr(6))];

    for(let i = 0; i < combatants.length; i++)
    {
        //if there is already one of the monsters, increment it's count
        if(combatants[i].monster.slug == monster.slug)
        {
            combatants[i].count++;
            document.querySelector("#monstercount" + combatants[i].monster.slug).innerHTML = combatants[i].count;
            updateDifficulty();
            return;
        }
    }

    //create a new combatant entry
    let newcombatant = new combatant(monster, 1);
    let monsterList = document.querySelector("#combatMonsters");
    //using append child to not mess with previously created eventlisteners
    let newMonsterItem = monsterList.appendChild(document.createElement("div"));
    newMonsterItem.setAttribute("class", "combatantBlock");
    newMonsterItem.setAttribute("id", "monsterblock" + monster.slug);
    newMonsterItem.innerHTML =
    "<span id='monstercount" + monster.slug + "'>1</span>" + 
    "<button type='button' id='addmonster" + monster.slug + 
    "'>+</button>" + "<button type='button' id='submonster" + monster.slug + 
    "'>-</button>" + monster.name + " | CR: " + monster.challenge_rating;

    //set up + and -
    document.querySelector("#addmonster" + monster.slug).onclick = combatantChangeCount;
    document.querySelector("#submonster" + monster.slug).onclick = combatantChangeCount;
    combatants.push(newcombatant);
    updateDifficulty();
}

//+/- buttons
function combatantChangeCount(e) {
    //find the combatant entry from e
    let combatantSlug = e.target.id.substr(10);
    let index = -1;
    for(let i = 0; i < combatants.length; i++) {
        if(combatantSlug == combatants[i].monster.slug)
        {
            index = i;
            i = 9999;
        }
    }

    if(e.target.id.substr(0, 3) == "add") {
        combatants[index].count++;
    }
    else {
        combatants[index].count--;
        if(combatants[index].count <= 0) {//removes the DOM element if there are 0 left
            let monsterBlock = document.querySelector("#monsterblock" + combatantSlug)
            monsterBlock.parentNode.removeChild(monsterBlock);
            combatants.splice(index, 1); //this deletes the combatant from the array and shifts the rest down
            updateDifficulty();
            return;
        }
    }
    //update the html
    document.querySelector("#monstercount" + combatantSlug).innerHTML = combatants[index].count;
    updateDifficulty();
}

//the rule book has a lot of arbitrary numbers on encounter balancing, hence all the if statements
function updateDifficulty() {

    difficultyElem = document.querySelector("#encounterdiff");
    console.log(combatants.length);
    if(combatants.length <= 0) {
        difficultyElem.innerHTML = "Add monsters to see difficulty rating.";
        return;
    }

    playercount = document.querySelector("#playercount").value;
    playerlevel = document.querySelector("#playerlevel").value - 1;

    let totalxp = 0;
    let monstercount = 0;
    for(let i = 0; i < combatants.length; i++) {
        let monsterxp = 0;
        //enter fractional CR xp values
        if(combatants[i].monster.challenge_rating == "1/8") {
            monsterxp = 25;
        }
        else if(combatants[i].monster.challenge_rating == "1/4") {
            monsterxp = 50;
        }
        else if(combatants[i].monster.challenge_rating == "1/2") {
            monsterxp = 100;
        }
        else { //get xp from table
            monsterxp = crxp[parseInt(combatants[i].monster.challenge_rating)];
        }
        monstercount += combatants[i].count;
        totalxp += combatants[i].count * monsterxp;
    }

    let xpmult = 1; //this is for balancing uneven numbers of monsters/players
    if(monstercount >= 15) {
        xpmult = 4;
    }
    else if (monstercount >= 11) { 
        xpmult = 3;
    }
    else if (monstercount >= 7) {
        xpmult = 2.5;
    }
    else if (monstercount >= 3) { 
        xpmult = 2;
    }
    else if (monstercount >= 2) {
        xpmult = 1.5;
    }

    //adjust xpmult for PC party size
    if(playercount >= 6) {
        if(xpmult == 4) {
            xpmult = 3;
        }
        else {
            xpmult -= .5;
        }
    }
    else if(playercount <= 2) {
        if(xpmult == 4) {
            xpmult = 5;
        }
        else if (xpmult == 3) {
            xpmult = 4;
        }
        else {
            xpmult += .5;
        }
    }

    totalxp *= xpmult;

    let difficulty = 0; //0=easy 1=medium 2=hard 3=deadly
    for(let i = 0; i < 4; i++)
    {
        if(totalxp > xpthresh[playerlevel][i])
        {
            difficulty = i;
        }
    }
    let difficultyStatement = "Your encounter is: <br><em>";

    switch(difficulty) {
        case 0:
            difficultyStatement += "Easy.</em> An easy encounter doesn't tax the characters' resources or put them in serious peril. They might lose a few hit points, but victory is pretty much guaranteed.";
            break;
        case 1: 
            difficultyStatement += "Medium.</em> A medium encounter usually has one or two scary moments for the players, but the characters should emerge victorious with no casualties. One or more of them might need to use healing resources.";
            break;

        case 2:
            difficultyStatement += "Hard.</em> A hard encounter could go badly for the adventurers. Weaker characters might get taken out of the fight, and there's a slim chance that one or more characters might die.";
            break;

        case 3:
            difficultyStatement += "Deadly.</em> A deadly encounter could be lethal for one or more player characters. Survival often requires good tactics and quick thinking, and the party risks defeat.";
            break;
    
        }
        difficultyStatement += "<br><br>Source: Dungeon Master's Guide, 5e pg. 82."
    difficultyElem.innerHTML = difficultyStatement;
}

class combatant {
    constructor(monster, count) {
        this.monster = monster;
        this.count = count;
    }
    
}