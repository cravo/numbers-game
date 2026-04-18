let rarities = {
    common: 0.7,
    uncommon: 0.2,
    rare: 0.09,
    legendary: 0.01
};

let rarityColors = {
    common: "green",
    uncommon: "blue",
    rare: "purple",
    legendary: "orange"
};

let numbers = {
    common: [],
    uncommon: [22, 33, 44, 55, 66, 77, 88, 10, 20, 30, 40, 50, 60, 70, 90],
    rare: [69, 78, 80, 29, 15, 27, 23, 2, 3, 5, 7, 11, 13, 17, 19, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],
    legendary: [0, 42, 99]
};

let playerData = {
    numbersCollected: [],
    totalSpins: 0,
    lastSpinTime: null,
    spinsRemainingToday: 0
}

let spinAnimationCounter = 0;

function populateCommonNumbers() {
    for (let i = 0; i <= 99; i++) {
        if (!numbers.uncommon.includes(i) && !numbers.rare.includes(i) && !numbers.legendary.includes(i)) {
            numbers.common.push(i);
        }
    }
}

function getRandomRarity() {
    let rand = Math.random();
    let cumulative = 0;
    for (let rarity in rarities) {
        cumulative += rarities[rarity];
        if (rand < cumulative) {
            return rarity;
        }
    }
    return "common"; // Fallback, should never reach here
}

function getRandomNumber() {
    let rarity = getRandomRarity();
    let numberList = numbers[rarity];
    let randomIndex = Math.floor(Math.random() * numberList.length);
    return numberList[randomIndex];
}

function getNumberRarity(number) {
    if (numbers.legendary.includes(number)) return "LEGENDARY!";
    if (numbers.rare.includes(number)) return "RARE!";
    if (numbers.uncommon.includes(number)) return "UNCOMMON!";
    return "COMMON!";
}

function collectionComplete() {
    return playerData.numbersCollected.length === 100;
}

function collectNumber(number) {
    playerData.numbersCollected.push(number);

    const numberDivs = document.querySelectorAll(".number");
    numberDivs.forEach(div => {
        if (parseInt(div.textContent) === number) {
            div.classList.remove("not-collected");
            div.classList.add("collected");
        }
    });
}

function hasCollected(number) {
    return playerData.numbersCollected.includes(number);
}

function spinAnimation() {
    let tempNumber = getRandomNumber();
    document.getElementById("spinner").textContent = tempNumber < 10 ? "0" + tempNumber : tempNumber;
    document.getElementById("spinner").style.backgroundColor = rarityColors[getNumberRarity(tempNumber).toLowerCase().replace("!", "")];
    if (spinAnimationCounter > 0) {
        spinAnimationCounter--;
        requestAnimationFrame(spinAnimation);
    }
    else
    {
        playerData.lastSpinTime = new Date().toISOString();

        let collectedNumber = getRandomNumber();
        
        document.getElementById("spinner").textContent = collectedNumber < 10 ? "0" + collectedNumber : collectedNumber;
        document.getElementById("spinner").style.backgroundColor = rarityColors[getNumberRarity(collectedNumber).toLowerCase().replace("!", "")];

        if (hasCollected(collectedNumber)) {
            // dupe, do not add to collection
            document.getElementById("currentNumber").textContent = "Current Number: " + collectedNumber + " DUPE!";
            return;
        }

        collectNumber(collectedNumber);

        savePlayerData();

        if (collectionComplete()) {
            alert("Congratulations! You have collected all the numbers!");
        }
    }
}

function spinForNumber() {  
    playerData.totalSpins++;
    document.getElementById("spins").textContent = "TOTAL SPINS: " + playerData.totalSpins;

    spinAnimationCounter = 200;
    requestAnimationFrame(spinAnimation);
};

function createNumberGrid() {
    const gridContainer = document.getElementById("numbers");
    for (let i = 0; i <= 99; i++) {
        const numberDiv = document.createElement("div");
        numberDiv.classList.add("number");
        if(!hasCollected(i))
        {
            numberDiv.classList.add("not-collected");
        }
        numberDiv.style.backgroundColor = rarityColors[getNumberRarity(i).toLowerCase().replace("!", "")];
        numberDiv.textContent = i < 10 ? "0" + i : i;
        gridContainer.appendChild(numberDiv);
    }
}

function checkForDuplicates() {
    let allNumbers = [...numbers.common, ...numbers.uncommon, ...numbers.rare, ...numbers.legendary];
    let uniqueNumbers = new Set(allNumbers);
    if (uniqueNumbers.size !== allNumbers.length) {
        console.error("Duplicate numbers found in rarity lists!");
        // output duplicates for debugging
        let duplicates = allNumbers.filter((item, index) => allNumbers.indexOf(item) !== index);
        console.error("Duplicates: ", duplicates);
    }
}

function spunToday() {
    if(!playerData.lastSpinTime) {
        return false;
    }

    const lastSpinDate = new Date(playerData.lastSpinTime);
    const now = new Date();
    return lastSpinDate.toDateString() === now.toDateString();
}

function canSpin() {
    if (collectionComplete()) {
        return false;
    }

    if(spinAnimationCounter > 0) {
        return false;
    }

    if(playerData.spinsRemainingToday <= 0) {
        return false;
    }

    return true;
}

function savePlayerData() {
    localStorage.setItem("numbersGamePlayerData", JSON.stringify(playerData));
}

function loadPlayerData() {
    const data = localStorage.getItem("numbersGamePlayerData");
    if (data) {
        playerData = JSON.parse(data);
    }
}

function updateSpinsRemaining() {
    document.getElementById("spinsRemaining").textContent = "SPINS REMAINING TODAY: " + playerData.spinsRemainingToday;
}

window.addEventListener("beforeunload", savePlayerData);
loadPlayerData();

// if player hasn't spun today, reset spinsRemainingToday
if(!spunToday()) {
    playerData.spinsRemainingToday = 1 + Math.floor(Math.random() * 5); // 1-5 spins per day
    savePlayerData();
}

populateCommonNumbers();
checkForDuplicates();
createNumberGrid();
updateSpinsRemaining();

if(playerData.spinsRemainingToday <= 0) {
    document.getElementById("collectButton").classList.add("disabled-button");
    document.getElementById("collectButton").textContent = "COME BACK TOMORROW!";
}
else {
    document.getElementById("collectButton").addEventListener("click", () => {
        if(canSpin()) {
            playerData.spinsRemainingToday--;

            updateSpinsRemaining();

            document.getElementById("collectButton").classList.add("disabled-button");

            spinForNumber();

            savePlayerData();

            if(playerData.spinsRemainingToday <= 0) {
                document.getElementById("collectButton").textContent = "COME BACK TOMORROW!";
            }
            else
            {
                document.getElementById("collectButton").classList.remove("disabled-button");
            }
        }});
}


