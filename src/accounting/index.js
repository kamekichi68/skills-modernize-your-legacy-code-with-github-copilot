const readline = require('readline');

class DataProgram {
    constructor() {
        this.storageBalance = 1000.00;
    }

    readBalance() {
        return this.storageBalance;
    }

    writeBalance(balance) {
        this.storageBalance = balance;
    }
}

class Operations {
    constructor(dataProgram) {
        this.dataProgram = dataProgram;
    }

    viewBalance() {
        const balance = this.dataProgram.readBalance();
        console.log(`Current balance: ${balance.toFixed(2)}`);
    }

    creditAccount() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter credit amount: ', (amountStr) => {
            const amount = parseFloat(amountStr);
            if (isNaN(amount)) {
                console.log('Invalid amount. Please enter a valid number.');
                rl.close();
                return;
            }
            let balance = this.dataProgram.readBalance();
            balance += amount;
            this.dataProgram.writeBalance(balance);
            console.log(`Amount credited. New balance: ${balance.toFixed(2)}`);
            rl.close();
        });
    }

    debitAccount() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter debit amount: ', (amountStr) => {
            const amount = parseFloat(amountStr);
            if (isNaN(amount)) {
                console.log('Invalid amount. Please enter a valid number.');
                rl.close();
                return;
            }
            let balance = this.dataProgram.readBalance();
            if (balance >= amount) {
                balance -= amount;
                this.dataProgram.writeBalance(balance);
                console.log(`Amount debited. New balance: ${balance.toFixed(2)}`);
            } else {
                console.log('Insufficient funds for this debit.');
            }
            rl.close();
        });
    }
}

class MainProgram {
    constructor() {
        this.dataProgram = new DataProgram();
        this.operations = new Operations(this.dataProgram);
        this.continueFlag = true;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    displayMenu() {
        console.log('--------------------------------');
        console.log('Account Management System');
        console.log('1. View Balance');
        console.log('2. Credit Account');
        console.log('3. Debit Account');
        console.log('4. Exit');
        console.log('--------------------------------');
    }

    processChoice(choice) {
        switch (choice) {
            case '1':
                this.operations.viewBalance();
                this.promptUser();
                break;
            case '2':
                this.operations.creditAccount();
                // Note: creditAccount handles its own input, so we need to prompt after
                setTimeout(() => this.promptUser(), 100); // Small delay to allow async input
                break;
            case '3':
                this.operations.debitAccount();
                setTimeout(() => this.promptUser(), 100);
                break;
            case '4':
                this.continueFlag = false;
                console.log('Exiting the program. Goodbye!');
                this.rl.close();
                break;
            default:
                console.log('Invalid choice, please select 1-4.');
                this.promptUser();
                break;
        }
    }

    promptUser() {
        if (!this.continueFlag) return;
        this.displayMenu();
        this.rl.question('Enter your choice (1-4): ', (choice) => {
            this.processChoice(choice.trim());
        });
    }

    run() {
        this.promptUser();
    }
}

// Only run the application if this file is executed directly
if (require.main === module) {
    const app = new MainProgram();
    app.run();
}

module.exports = { DataProgram, Operations, MainProgram };