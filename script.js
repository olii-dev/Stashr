// Set goal
function setGoal() {
    const goalName = document.getElementById('goalName').value;
    const goalAmount = parseFloat(document.getElementById('goalAmount').value);

    if (goalName && !isNaN(goalAmount)) {
        localStorage.setItem('goalName', goalName);
        localStorage.setItem('goalAmount', goalAmount);
        localStorage.setItem('currentSavings', 0);
        localStorage.setItem('transactions', JSON.stringify([]));
        displayGoal();
        displayHistory();
        hideCreateIfGoalExists();
    }
}

// Show goal and current savings
function displayGoal() {
    const goalName = localStorage.getItem('goalName');
    const goalAmount = localStorage.getItem('goalAmount');
    const currentSavings = localStorage.getItem('currentSavings');

    if (goalName && goalAmount) {
        document.getElementById('displayGoalName').innerText = goalName;
        document.getElementById('displayGoalAmount').innerText = goalAmount;
        document.getElementById('currentSavings').innerText = currentSavings;
    }
}

// Deposit money
function deposit() {
    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    let currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    if (!isNaN(depositAmount)) {
        // Make sure the savings don't pass the goal amount
        const newSavings = Math.min(currentSavings + depositAmount, goalAmount);
        
        // Adds Deposit to transaction history
        transactions.push({ type: 'deposit', amount: depositAmount, date: new Date() });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        localStorage.setItem('currentSavings', newSavings);
        updateProgressStatus();
        displayGoal();
        displayHistory();
    }
}

// Withdraw money
function withdraw() {
    const withdrawAmount = parseFloat(document.getElementById('withdrawAmount').value);
    let currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    if (!isNaN(withdrawAmount)) {
        currentSavings = Math.max(0, currentSavings - withdrawAmount);
        localStorage.setItem('currentSavings', currentSavings);
        
        transactions.push({ type: 'withdraw', amount: withdrawAmount, date: new Date() });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        displayGoal();
        displayHistory();
    }
}

// Shows transaction history
function displayHistory() {
    const historySection = document.getElementById('history');
    historySection.innerHTML = '';

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    transactions.forEach((transaction) => {
        const listItem = document.createElement('li');
        listItem.classList.add('transaction-item');

        const icon = document.createElement('span');
        if (transaction.type === 'deposit') {
            icon.innerHTML = '⬆';
            icon.style.color = 'green';
        } else {
            icon.innerHTML = '⬇';
            icon.style.color = 'red';
        }

        const text = document.createTextNode(
            `${transaction.type === 'deposit' ? 'Added' : 'Withdrew'} $${transaction.amount} on ${new Date(
                transaction.date
            ).toLocaleString()}`
        );

        listItem.appendChild(icon);
        listItem.appendChild(text);
        historySection.appendChild(listItem);
    });
}

// Let's user know when they reach their goal! (Yay)
function updateProgressStatus() {
    const currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));

    if (currentSavings >= goalAmount) {
        alert('Congratulations! You have reached your goal!');
    }
}

// Reset
function resetAll() {
    const confirmation = confirm('Are you sure you want to reset all data? This action cannot be undone.');

    if (confirmation) {
        localStorage.clear();
        showGoalCreate();
        document.getElementById('displayGoalName').innerText = '';
        document.getElementById('displayGoalAmount').innerText = '0';
        document.getElementById('currentSavings').innerText = '0';
        document.getElementById('history').innerHTML = '';
        alert('All data has been reset.');
    } else {
        alert('Reset cancelled.');
    }
}

function hideCreateIfGoalExists() {
    const goalName = localStorage.getItem('goalName');
    if(goalName){
        document.getElementById("goal-section").style.display = 'none';
    }
}

function showGoalCreate() {
    document.getElementById("goal-section").style.display = 'block';
    console.log({goalName}, document.getElementsByClassName("goal-section"));
}

window.onload = function () {
    displayGoal();
    hideCreateIfGoalExists();
    displayHistory();
};