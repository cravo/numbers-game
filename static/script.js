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
    lastSpinDay: null,
    lastSpinTime: null,
    spinsRemainingToday: 0
}

let spinAnimationCounter = 0;

let maxSpinsPerDay = 5;

function getLocalDayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function populateCommonNumbers() {
    numbers.common = [];
    for (let i = 0; i <= 99; i++) {
        if (!numbers.uncommon.includes(i) && !numbers.rare.includes(i) && !numbers.legendary.includes(i)) {
            numbers.common.push(i);
        }
    }
}

function getRandomRarity() {
    let rand = Math.random();
    let cumulative = 0;
    const rarityEntries = Object.entries(rarities);
    for (const [rarity, weight] of rarityEntries) {
        cumulative += weight;
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
    return new Set(playerData.numbersCollected.filter(num => Number.isInteger(num) && num >= 0 && num <= 99)).size === 100;
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
        playerData.lastSpinDay = getLocalDayKey();
        playerData.lastSpinTime = new Date().toISOString();

        let collectedNumber = getRandomNumber();
        
        document.getElementById("spinner").textContent = collectedNumber < 10 ? "0" + collectedNumber : collectedNumber;
        document.getElementById("spinner").style.backgroundColor = rarityColors[getNumberRarity(collectedNumber).toLowerCase().replace("!", "")];

        if (!hasCollected(collectedNumber)) {
            collectNumber(collectedNumber);

            if (collectionComplete()) {
                alert("Congratulations! You have collected all the numbers!");
            }
        }

        savePlayerData();
        updateCollectButtonState();
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
    let hasError = false;

    if (uniqueNumbers.size !== allNumbers.length) {
        hasError = true;
        console.error("Duplicate numbers found in rarity lists!");
        // output duplicates for debugging
        let duplicates = allNumbers.filter((item, index) => allNumbers.indexOf(item) !== index);
        console.error("Duplicates: ", duplicates);
    }

    const invalidNumbers = allNumbers.filter(num => !Number.isInteger(num) || num < 0 || num > 99);
    if (invalidNumbers.length > 0) {
        hasError = true;
        console.error("Out-of-range numbers found in rarity lists:", invalidNumbers);
    }

    const missingNumbers = [];
    for (let i = 0; i <= 99; i++) {
        if (!uniqueNumbers.has(i)) {
            missingNumbers.push(i);
        }
    }
    if (missingNumbers.length > 0) {
        hasError = true;
        console.error("Missing numbers in rarity lists:", missingNumbers);
    }

    return !hasError;
}

function spunToday() {
    if (!playerData.lastSpinDay) {
        return false;
    }

    return playerData.lastSpinDay === getLocalDayKey();
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
        try {
            const loadedData = JSON.parse(data);

            // validate loaded data
            if (!loadedData.numbersCollected || !Array.isArray(loadedData.numbersCollected)) {
                throw new Error("Invalid numbersCollected data");
            }

            let normalizedSpinsRemaining = Number(loadedData.spinsRemainingToday);
            if (!Number.isInteger(normalizedSpinsRemaining) || normalizedSpinsRemaining < 0 || normalizedSpinsRemaining > maxSpinsPerDay) {
                normalizedSpinsRemaining = 0;
            }

            // rebuild numbersCollected as unique integers to prevent tampering or corruption
            const normalizedNumbersCollected = [...new Set(loadedData.numbersCollected)].filter(num => Number.isInteger(num) && num >= 0 && num <= 99);

            let normalizedTotalSpins = Number(loadedData.totalSpins);
            if (!Number.isInteger(normalizedTotalSpins) || normalizedTotalSpins < 0) {
                normalizedTotalSpins = 0;
            }

            let normalizedLastSpinDay = null;
            if (typeof loadedData.lastSpinDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(loadedData.lastSpinDay)) {
                normalizedLastSpinDay = loadedData.lastSpinDay;
            } else if (loadedData.lastSpinTime) {
                const parsedLastSpin = new Date(loadedData.lastSpinTime);
                if (!Number.isNaN(parsedLastSpin.getTime())) {
                    normalizedLastSpinDay = getLocalDayKey(parsedLastSpin);
                }
            }

            playerData = {
                numbersCollected: normalizedNumbersCollected,
                totalSpins: normalizedTotalSpins,
                lastSpinDay: normalizedLastSpinDay,
                lastSpinTime: loadedData.lastSpinTime || null,
                spinsRemainingToday: normalizedSpinsRemaining
            };

        } catch (e) {
            console.error("Error parsing player data from localStorage, resetting data.", e);
            playerData = {
                numbersCollected: [],
                totalSpins: 0,
                lastSpinDay: null,
                lastSpinTime: null,
                spinsRemainingToday: 0
            };
        }
    }
}

function updateTotalSpins() {
    document.getElementById("spins").textContent = "TOTAL SPINS: " + playerData.totalSpins;
}

function updateCollectButtonState() {
    const collectButton = document.getElementById("collectButton");

    const isOutOfSpins = playerData.spinsRemainingToday <= 0;
    const isSpinAnimating = spinAnimationCounter > 0;
    const isComplete = collectionComplete();

    const shouldDisable = isOutOfSpins || isSpinAnimating || isComplete;
    collectButton.disabled = shouldDisable;
    collectButton.classList.toggle("disabled-button", shouldDisable);

    if (isComplete) {
        collectButton.textContent = "COLLECTION COMPLETE!";
    } else if (isOutOfSpins) {
        collectButton.textContent = "COME BACK TOMORROW!";
    } else {
        collectButton.textContent = "SPIN FOR A NUMBER!";
    }
}

function updateSpinsRemaining() {
    document.getElementById("spinsRemaining").textContent = "SPINS REMAINING TODAY: " + playerData.spinsRemainingToday;
}

window.addEventListener("beforeunload", savePlayerData);
loadPlayerData();

// if player hasn't spun today, reset spinsRemainingToday
if(!spunToday()) {
    playerData.lastSpinDay = getLocalDayKey();
    playerData.spinsRemainingToday = 1 + Math.floor(Math.random() * maxSpinsPerDay); // 1-maxSpinsPerDay spins per day
    savePlayerData();
}

populateCommonNumbers();
if (!checkForDuplicates()) {
    const collectButton = document.getElementById("collectButton");
    collectButton.disabled = true;
    collectButton.classList.add("disabled-button");
    collectButton.textContent = "CONFIG ERROR";
    throw new Error("Invalid number rarity configuration. Check console errors.");
}
createNumberGrid();
updateSpinsRemaining();
updateTotalSpins();
updateCollectButtonState();

document.getElementById("collectButton").addEventListener("click", () => {
    if (!canSpin()) {
        updateCollectButtonState();
        return;
    }

    // Mark today's allowance as consumed before animation to prevent reload exploits.
    playerData.lastSpinDay = getLocalDayKey();
    playerData.lastSpinTime = new Date().toISOString();
    playerData.spinsRemainingToday--;
    savePlayerData();

    updateSpinsRemaining();

    spinForNumber();
    updateCollectButtonState();
});


