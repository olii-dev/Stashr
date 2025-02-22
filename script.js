// Set goal
// Set goal
function setGoal() {
    const goalName = document.getElementById('goalName').value;
    const goalAmount = parseFloat(document.getElementById('goalAmount').value);
    const goalDate = document.getElementById('goalDate').value;

    if (goalName && !isNaN(goalAmount) && goalDate) {
        localStorage.setItem('goalName', goalName);
        localStorage.setItem('goalAmount', goalAmount);
        localStorage.setItem('goalDate', goalDate);
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
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));
    const goalDate = localStorage.getItem('goalDate');
    const currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;

    if (goalName && goalAmount && goalDate) {
        document.getElementById('displayGoalName').innerText = goalName;
        document.getElementById('displayGoalAmount').innerText = goalAmount;
        document.getElementById('displayGoalDate').innerText = new Date(goalDate).toLocaleDateString();
        document.getElementById('currentSavings').innerText = currentSavings;

        const percentage = (currentSavings / goalAmount) * 100;
        document.getElementById('progressBar').value = percentage;
        document.getElementById('progressText').innerText = `${percentage.toFixed(1)}%`;

        // Calculate and display the remaining amount
        const remaining = goalAmount - currentSavings;
        document.getElementById('remainingAmount').innerText = remaining.toFixed(2);

        // Calculate and display the remaining days
        const today = new Date();
        const targetDate = new Date(goalDate);
        const timeDiff = targetDate - today;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        document.getElementById('daysRemaining').innerText = daysRemaining > 0 ? daysRemaining : 0;
    }
}

// Edit goal amount
function editGoalAmount() {
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));

    const input = document.createElement('input');
    input.type = 'number';
    input.value = goalAmount;

    const displayGoalAmount = document.getElementById('displayGoalAmount');
    displayGoalAmount.innerHTML = '';
    displayGoalAmount.appendChild(input);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('edit-button');

    saveButton.onclick = function () {
        const newGoalAmount = parseFloat(input.value);
        localStorage.setItem('goalAmount', newGoalAmount);
        displayGoal();
        progressBar();
    };

    displayGoalAmount.appendChild(saveButton);
}

// Edit goal date
function editGoalDate() {
    const goalDate = localStorage.getItem('goalDate');

    const input = document.createElement('input');
    input.type = 'date';
    input.value = goalDate;

    const displayGoalDate = document.getElementById('displayGoalDate');
    displayGoalDate.innerHTML = '';
    displayGoalDate.appendChild(input);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('edit-button');

    saveButton.onclick = function () {
        const newGoalDate = input.value;
        localStorage.setItem('goalDate', newGoalDate);
        displayGoal();
    };

    displayGoalDate.appendChild(saveButton);
}

// Show goal and current savings
function displayGoal() {
    const goalName = localStorage.getItem('goalName');
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));
    const goalDate = localStorage.getItem('goalDate');
    const currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;

    if (goalName && goalAmount && goalDate) {
        document.getElementById('displayGoalName').innerText = goalName;
        document.getElementById('displayGoalAmount').innerText = goalAmount;

        // Format the goal date as day/month/year
        const targetDate = new Date(goalDate);
        const formattedDate = `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}/${targetDate.getFullYear()}`;
        document.getElementById('displayGoalDate').innerText = formattedDate;

        document.getElementById('currentSavings').innerText = currentSavings;

        const percentage = (currentSavings / goalAmount) * 100;
        document.getElementById('progressBar').value = percentage;
        document.getElementById('progressText').innerText = `${percentage.toFixed(1)}%`;

        // Calculate and display the remaining amount
        const remaining = goalAmount - currentSavings;
        document.getElementById('remainingAmount').innerText = remaining.toFixed(2);

        // Calculate and display the remaining days
        const today = new Date();
        const timeDiff = targetDate - today;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        document.getElementById('daysRemaining').innerText = daysRemaining > 0 ? daysRemaining : 0;
    }
}

window.onload = function () {
    displayGoal();
    displayHistory();
};
// Deposit money
function deposit() {
    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    let currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    if (!isNaN(depositAmount)) {
        const newSavings = Math.min(currentSavings + depositAmount, goalAmount);

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

    transactions.forEach((transaction, index) => {
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

        // Add pen icon for editing
        const editButton = document.createElement('button');
        editButton.classList.add('edit-icon');
        editButton.innerHTML = '🖊';
        editButton.addEventListener('click', () => editTransaction(index));
        listItem.appendChild(editButton);

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
    const confirmation = confirm('Are you sure you want to reset all data? This cannot be undone.');

    if (confirmation) {
        localStorage.clear();
        showGoalCreate();
        document.getElementById('progressBar').value = 0;
        document.getElementById('progressText').innerText = '';
        document.getElementById('displayGoalName').innerText = '';
        document.getElementById('displayGoalAmount').innerText = '0';
        document.getElementById('currentSavings').innerText = '0';
        document.getElementById('history').innerHTML = '';
        document.getElementById('goalName').value = '';
        document.getElementById('goalAmount').value = '';
        document.getElementById('withdrawAmount').value = '';
        document.getElementById('depositAmount').value = '';
        
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

let previousTransaction = null;

function editTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transaction = transactions[index];

    previousTransaction = { ...transaction };

    const historySection = document.getElementById('history');
    const listItem = historySection.children[index];

    listItem.innerHTML = '';

    const icon = document.createElement('span');
    if (transaction.type === 'deposit') {
        icon.innerHTML = '⬆';
        icon.style.color = 'green';
    } else {
        icon.innerHTML = '⬇';
        icon.style.color = 'red';
    }

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.value = transaction.amount;

    const transactionDate = new Date(transaction.date);
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = transactionDate.toISOString().slice(0, 10);

    listItem.appendChild(icon);
    listItem.appendChild(amountInput);
    listItem.appendChild(dateInput);

    // Save button
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('edit-button');
    saveButton.addEventListener('click', () => saveTransaction(index, amountInput.value, dateInput.value, transactionDate));
    listItem.appendChild(saveButton);

    const undoButton = document.createElement('button');
    undoButton.innerText = 'Undo';
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', () => deleteTransaction(index));
    listItem.appendChild(undoButton);

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.classList.add('cancel-button');
    cancelButton.addEventListener('click', () => cancelEdit(index));
    listItem.appendChild(cancelButton);
}

// Cancel Transaction Edit
function cancelEdit(index) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    transactions[index] = previousTransaction;

    localStorage.setItem('transactions', JSON.stringify(transactions));

    displayGoal();
    displayHistory();
}

// Undo Button
function showUndoButton(index) {
    const undoButton = document.createElement('button');
    undoButton.innerText = 'Undo';
    undoButton.setAttribute('id', 'undoButton');
    undoButton.addEventListener('click', () => undoTransaction(index));

    document.getElementById('history').appendChild(undoButton);
}

function undoTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    transactions[index] = previousTransaction;

    localStorage.setItem('transactions', JSON.stringify(transactions));

    displayGoal();
    displayHistory();
}


function saveTransaction(index, newAmount, newDate, originalDate) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const originalTime = originalDate.toTimeString().split(' ')[0];
    const combinedDateTime = new Date(`${newDate}T${originalTime}`);
    
    transactions[index].amount = parseFloat(newAmount);
    transactions[index].date = combinedDateTime.toISOString();

    localStorage.setItem('transactions', JSON.stringify(transactions));

    recalculateSavings();
    displayHistory();
}

function recalculateSavings() {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let currentSavings = 0;

    transactions.forEach((transaction) => {
        if (transaction.type === 'deposit') {
            currentSavings += transaction.amount;
        } else {
            currentSavings -= transaction.amount;
        }
    });

    localStorage.setItem('currentSavings', currentSavings);

    displayGoal();
}

function editGoalName() {
    const goalName = localStorage.getItem('goalName');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = goalName;
    
    const displayGoalName = document.getElementById('displayGoalName');
    displayGoalName.innerHTML = '';
    displayGoalName.appendChild(input);
    
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('edit-button');
    
    saveButton.onclick = function () {
        const newGoalName = input.value;
        localStorage.setItem('goalName', newGoalName);
        displayGoal();
    };

    displayGoalName.appendChild(saveButton);
}

// Edit goal date
function editGoalDate() {
    const goalDate = localStorage.getItem('goalDate');

    const input = document.createElement('input');
    input.type = 'date';
    input.value = goalDate;

    const displayGoalDate = document.getElementById('displayGoalDate');
    displayGoalDate.innerHTML = '';
    displayGoalDate.appendChild(input);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('edit-button');

    saveButton.onclick = function () {
        const newGoalDate = input.value;
        localStorage.setItem('goalDate', newGoalDate);
        displayGoal();
    };

    displayGoalDate.appendChild(saveButton);
}

function editGoalAmount() {
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));

    const input = document.createElement('input');
    input.type = 'number';
    input.value = goalAmount;

    const displayGoalAmount = document.getElementById('displayGoalAmount');
    displayGoalAmount.innerHTML = '';
    displayGoalAmount.appendChild(input);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('edit-button');

    saveButton.onclick = function () {
        const newGoalAmount = parseFloat(input.value);
        localStorage.setItem('goalAmount', newGoalAmount);
        displayGoal();
        progressBar();
    };

    displayGoalAmount.appendChild(saveButton);
}

// Delete Transaction
function deleteTransaction(index) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const removedTransaction = transactions.splice(index, 1)[0];

    localStorage.setItem('transactions', JSON.stringify(transactions));

    let currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;

    if (removedTransaction.type === 'deposit') {
        currentSavings -= removedTransaction.amount;
    } else if (removedTransaction.type === 'withdraw') {
        currentSavings += removedTransaction.amount;
    }

    localStorage.setItem('currentSavings', currentSavings);

    displayGoal();
    displayHistory();
}

// Toggle Dark Mode with Persistence
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    // Update the button text
    const currentMode = document.body.classList.contains('dark-mode') ? '🔆' : '🌙';
    document.getElementById('dark-mode-toggle').innerText = currentMode;

    // Save the current mode to localStorage
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

// Check and Apply Theme on Page Load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').innerText = '🔆';
    } else {
        document.getElementById('dark-mode-toggle').innerText = '🌙';
    }

    // Attach the toggleDarkMode function to the button
    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
});