function calculatePermutations(n, r) {
    if (n < r) return 0;
    let result = 1;
    for (let i = 0; i < r; i++) {
        result *= n - i;
    }
    return result;
}

function validateInputs(params) {
    let valid = true;
    document.querySelectorAll("label.error").forEach(label => label.classList.remove("error"));
    document.querySelectorAll("input.error").forEach(input => input.classList.remove("error"));

    if (params.mines < 1 || params.mines > 24) {
        valid = false;
        document.getElementById("label-mines").classList.add("error");
        document.getElementById("mines").classList.add("error");
    }

    const maxPicks = 25 - params.mines;
    if (params.picks < 1 || params.picks > maxPicks) {
        valid = false;
        document.getElementById("label-picks").classList.add("error");
        document.getElementById("picks").classList.add("error");
    }

    if (params.startingBalance < 10 || params.startingBalance > 10000) {
        valid = false;
        document.getElementById("label-startingBalance").classList.add("error");
        document.getElementById("startingBalance").classList.add("error");
    }

    if (params.winningThreshold < 10 || params.winningThreshold > 100000) {
        valid = false;
        document.getElementById("label-winningThreshold").classList.add("error");
        document.getElementById("winningThreshold").classList.add("error");
    }

    if (params.startingWager < 0.2 || params.startingWager > 1000) {
        valid = false;
        document.getElementById("label-startingWager").classList.add("error");
        document.getElementById("startingWager").classList.add("error");
    }

    if (params.lossIncreasePercent < 0 || params.lossIncreasePercent > 10000) {
        valid = false;
        document.getElementById("label-lossIncreasePercent").classList.add("error");
        document.getElementById("lossIncreasePercent").classList.add("error");
    }

    if (params.winIncreasePercent < 0 || params.winIncreasePercent > 10000) {
        valid = false;
        document.getElementById("label-winIncreasePercent").classList.add("error");
        document.getElementById("winIncreasePercent").classList.add("error");
    }

    return valid;
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Document is fully loaded and parsed!");
    
    document.getElementById('simulateButton').addEventListener('click', () => {
        const form = document.getElementById('gamblingForm');
        const formData = new FormData(form);
    
        const params = {
            mines: parseInt(formData.get('mines'), 10),
            picks: parseInt(formData.get('picks'), 10),
            startingBalance: parseFloat(formData.get('startingBalance')),
            winningThreshold: parseFloat(formData.get('winningThreshold')),
            startingWager: parseFloat(formData.get('startingWager')),
            lossIncreasePercent: parseFloat(formData.get('lossIncreasePercent')),
            winIncreasePercent: parseFloat(formData.get('winIncreasePercent')),
            simulationCount: parseInt(formData.get('simulationCount').replace(/,/g, ''), 10)
        };
    
        if (!validateInputs(params)) {
            alert("Please fix errors in the form before proceeding.");
            return;
        }
    
        const winPercentage = calculatePermutations(25 - params.mines, params.picks) / calculatePermutations(25, params.picks);
        const hitPayout = 0.99 / winPercentage;
    
        let successes = 0;
        let failures = 0;
        let totalWagered = 0;
        let totalWinLoss = 0;
    
        for (let i = 0; i < params.simulationCount; i++) {
            let currentBalance = params.startingBalance;
            let currentBet = params.startingWager;
    
            while (true) {
                if (currentBet > currentBalance) {
                    failures++;
                    totalWinLoss += currentBalance - params.startingBalance;
                    break;
                }
    
                totalWagered += currentBet;
                currentBalance -= currentBet;
    
                const random = Math.random();
                if (random <= winPercentage) {
                    currentBalance += currentBet * hitPayout;
                    currentBet = params.startingWager;
                } else {
                    currentBet += currentBet * (params.lossIncreasePercent / 100);
                }
    
                if (currentBalance >= params.startingBalance + params.winningThreshold) {
                    successes++;
                    totalWinLoss += currentBalance - params.startingBalance;
                    break;
                }
            }
        }
    
        const successPercentage = (successes / params.simulationCount * 100).toFixed(2);
        const totalWageredFormatted = totalWagered.toLocaleString();
        const totalWinLossFormatted = totalWinLoss.toLocaleString(undefined, { style: "decimal", maximumFractionDigits: 2 });
        const winLossStyle = totalWinLoss >= 0 ? "color: #00cc00;" : "color: #cc0000;";
        const winLossPercentage = (totalWinLoss / totalWagered * 100).toFixed(2);
    
        document.getElementById('results').innerHTML = `
            <table>
                <tr><th>Successes</th><td>${successes.toLocaleString()}</td></tr>
                <tr><th>Failures</th><td>${failures.toLocaleString()}</td></tr>
                <tr><th>Success Percentage</th><td>${successPercentage}%</td></tr>
                <tr><th>Total Wagered</th><td>${totalWageredFormatted}</td></tr>
                <tr><th>Total Win/Loss</th><td style="${winLossStyle}">${totalWinLossFormatted}</td></tr>
                <tr><th>Win/Loss Percentage</th><td style="${winLossStyle}">${winLossPercentage}%</td></tr>
            </table>
        `;
    });
    
});

