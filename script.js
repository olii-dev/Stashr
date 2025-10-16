// Set goal
function setGoal() {
    const goalName = document.getElementById('goalName').value.trim();
    const goalAmount = parseFloat(document.getElementById('goalAmount').value);
    const goalDate = document.getElementById('goalDate').value;

    if (goalName && !isNaN(goalAmount) && goalAmount > 0 && goalDate) {
        localStorage.setItem('goalName', goalName);
        localStorage.setItem('goalAmount', goalAmount.toString());
        localStorage.setItem('goalDate', goalDate);
        localStorage.setItem('currentSavings', '0');
        localStorage.setItem('transactions', JSON.stringify([]));
        displayGoal();
        displayHistory();
        hideCreateIfGoalExists();
    } else {
        alert('Please enter a valid goal name, positive amount and target date.');
    }
}

// Show goal and current savings
function displayGoal() {
    const goalName = localStorage.getItem('goalName');
    const goalAmount = parseFloat(localStorage.getItem('goalAmount')) || 0;
    const goalDate = localStorage.getItem('goalDate');
    const currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;

    document.getElementById('displayGoalName').innerText = goalName || '';
    document.getElementById('displayGoalAmount').innerText = goalAmount || 0;
    document.getElementById('currentSavings').innerText = currentSavings.toFixed(2);

    if (goalDate) {
        const targetDate = new Date(goalDate);
        const formattedDate = `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}/${targetDate.getFullYear()}`;
        document.getElementById('displayGoalDate').innerText = formattedDate;

        const today = new Date();
        const timeDiff = targetDate - today;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        document.getElementById('daysRemaining').innerText = daysRemaining > 0 ? daysRemaining : 0;
    } else {
        document.getElementById('displayGoalDate').innerText = '';
        document.getElementById('daysRemaining').innerText = '';
    }

    const percentage = goalAmount > 0 ? (currentSavings / goalAmount) * 100 : 0;
    document.getElementById('progressBar').max = 100;
    document.getElementById('progressBar').value = Math.min(100, percentage);
    document.getElementById('progressText').innerText = `${Math.min(100, percentage).toFixed(1)}%`;

    const remaining = goalAmount - currentSavings;
    document.getElementById('remainingAmount').innerText = remaining > 0 ? remaining.toFixed(2) : '0.00';
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

/* Duplicate displayGoal removed — consolidated function above. */

// Initialize on load
function init() {
    displayGoal();
    hideCreateIfGoalExists();
    displayHistory();

    // No history search - removed per user request

    // Export / Import
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (importBtn) importBtn.addEventListener('click', () => importFile.click());
    if (importFile) importFile.addEventListener('change', handleImportFile);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd') document.getElementById('depositAmount').focus();
        if (e.key === 'w') document.getElementById('withdrawAmount').focus();
    });
}
// Deposit money
function deposit() {
    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    let currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;
    const goalAmount = parseFloat(localStorage.getItem('goalAmount'));
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    if (!isNaN(depositAmount)) {
        const newSavings = isFinite(goalAmount) && !isNaN(goalAmount) ? Math.min(currentSavings + depositAmount, goalAmount) : currentSavings + depositAmount;

        transactions.push({ type: 'deposit', amount: depositAmount, date: new Date().toISOString() });
        localStorage.setItem('transactions', JSON.stringify(transactions));

        localStorage.setItem('currentSavings', newSavings.toString());
        updateProgressStatus();
        displayGoal();
        displayHistory();
        document.getElementById('depositAmount').value = '';
    }
}

// Withdraw money
function withdraw() {
    const withdrawAmount = parseFloat(document.getElementById('withdrawAmount').value);
    let currentSavings = parseFloat(localStorage.getItem('currentSavings')) || 0;
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    if (!isNaN(withdrawAmount)) {
        currentSavings = Math.max(0, currentSavings - withdrawAmount);
        localStorage.setItem('currentSavings', currentSavings.toString());

        transactions.push({ type: 'withdraw', amount: withdrawAmount, date: new Date().toISOString() });
        localStorage.setItem('transactions', JSON.stringify(transactions));

        displayGoal();
        displayHistory();
        document.getElementById('withdrawAmount').value = '';
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

        const text = document.createElement('span');
        text.innerText = `${transaction.type === 'deposit' ? 'Added' : 'Withdrew'} $${parseFloat(transaction.amount).toFixed(2)} on ${new Date(
            transaction.date
        ).toLocaleString()}`;

        listItem.appendChild(icon);
        listItem.appendChild(text);

        // Add pen icon for editing
        const editButton = document.createElement('button');
        editButton.classList.add('edit-icon');
        editButton.setAttribute('aria-label', 'Edit transaction');
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

// Remove window.onload in favor of init() from DOMContentLoaded for consolidated setup

// Export data as JSON file
function exportData() {
    const data = {
        goalName: localStorage.getItem('goalName'),
        goalAmount: localStorage.getItem('goalAmount'),
        goalDate: localStorage.getItem('goalDate'),
        currentSavings: localStorage.getItem('currentSavings'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stashr-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function handleImportFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
        try {
            const data = JSON.parse(ev.target.result);
            if (data) {
                if (data.goalName) localStorage.setItem('goalName', data.goalName);
                if (data.goalAmount) localStorage.setItem('goalAmount', data.goalAmount);
                if (data.goalDate) localStorage.setItem('goalDate', data.goalDate);
                if (data.currentSavings) localStorage.setItem('currentSavings', data.currentSavings);
                if (Array.isArray(data.transactions)) localStorage.setItem('transactions', JSON.stringify(data.transactions));
                init();
                alert('Import successful');
            }
        } catch (err) {
            alert('Failed to import file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

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

// Consolidated initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    // If user has previously set a theme, use it. Otherwise follow OS preference.
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) btn.innerText = '🔆';
        localStorage.setItem('themeUserSet', 'true');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) btn.innerText = '🌙';
        localStorage.setItem('themeUserSet', 'true');
    } else {
        // detect OS preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
            const btn = document.getElementById('dark-mode-toggle');
            if (btn) btn.innerText = '🔆';
        } else {
            document.body.classList.remove('dark-mode');
            const btn = document.getElementById('dark-mode-toggle');
            if (btn) btn.innerText = '🌙';
        }
        // listen for system theme changes until user sets their own preference
        if (window.matchMedia) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const systemListener = (e) => {
                const userSet = localStorage.getItem('themeUserSet');
                if (userSet === 'true') return; // respect user preference
                if (e.matches) {
                    document.body.classList.add('dark-mode');
                    const btn = document.getElementById('dark-mode-toggle'); if (btn) btn.innerText = '🔆';
                } else {
                    document.body.classList.remove('dark-mode');
                    const btn = document.getElementById('dark-mode-toggle'); if (btn) btn.innerText = '🌙';
                }
            };
            try {
                mq.addEventListener('change', systemListener);
            } catch (err) {
                // Safari older syntax
                mq.addListener(systemListener);
            }
        }
    }

    // Attach the toggleDarkMode function to the button
    const dmBtn = document.getElementById('dark-mode-toggle');
    if (dmBtn) dmBtn.addEventListener('click', (e) => {
        // mark that user explicitly set a preference
        localStorage.setItem('themeUserSet', 'true');
        toggleDarkMode(e);
    });

    // Initialize app
    init();
});