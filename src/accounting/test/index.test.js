const readline = require('readline');

// Mock readline
jest.mock('readline', () => ({
    createInterface: jest.fn()
}));

const { DataProgram, Operations } = require('../index');

describe('DataProgram', () => {
    let dataProgram;

    beforeEach(() => {
        dataProgram = new DataProgram();
    });

    test('TC001 - View Initial Balance', () => {
        const balance = dataProgram.readBalance();
        expect(balance).toBe(1000.00);
    });

    test('TC013 - Balance Persistence After Restart', () => {
        // Simulate operations
        dataProgram.writeBalance(1500.00);
        expect(dataProgram.readBalance()).toBe(1500.00);

        // Restart (new instance)
        const newDataProgram = new DataProgram();
        expect(newDataProgram.readBalance()).toBe(1000.00);
    });
});

describe('Operations', () => {
    let dataProgram;
    let operations;
    let consoleSpy;
    let mockRl;

    beforeEach(() => {
        dataProgram = new DataProgram();
        operations = new Operations(dataProgram);
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        // Setup mock readline
        mockRl = {
            question: jest.fn(),
            close: jest.fn()
        };
        readline.createInterface.mockReturnValue(mockRl);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        jest.clearAllMocks();
    });

    test('TC001 - View Initial Balance', () => {
        operations.viewBalance();
        expect(consoleSpy).toHaveBeenCalledWith('Current balance: 1000.00');
    });

    test('TC002 - Credit Account - Valid Amount', () => {
        mockRl.question.mockImplementation((query, callback) => {
            callback('500.00');
        });

        operations.creditAccount();
        expect(dataProgram.readBalance()).toBe(1500.00);
        expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1500.00');
    });

    test('TC003 - Debit Account - Valid Amount', () => {
        // First credit to have balance
        dataProgram.writeBalance(1500.00);

        mockRl.question.mockImplementation((query, callback) => {
            callback('200.00');
        });

        operations.debitAccount();
        expect(dataProgram.readBalance()).toBe(1300.00);
        expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1300.00');
    });

    test('TC004 - Debit Account - Insufficient Funds', () => {
        dataProgram.writeBalance(1300.00);

        mockRl.question.mockImplementation((query, callback) => {
            callback('2000.00');
        });

        operations.debitAccount();
        expect(dataProgram.readBalance()).toBe(1300.00); // Should not change
        expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
    });

    test('TC008 - Credit Zero Amount', () => {
        dataProgram.writeBalance(1100.00);

        mockRl.question.mockImplementation((query, callback) => {
            callback('0.00');
        });

        operations.creditAccount();
        expect(dataProgram.readBalance()).toBe(1100.00);
        expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1100.00');
    });

    test('TC009 - Debit Zero Amount', () => {
        dataProgram.writeBalance(1100.00);

        mockRl.question.mockImplementation((query, callback) => {
            callback('0.00');
        });

        operations.debitAccount();
        expect(dataProgram.readBalance()).toBe(1100.00);
        expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1100.00');
    });

    test('TC010 - Credit Negative Amount', () => {
        dataProgram.writeBalance(1100.00);

        mockRl.question.mockImplementation((query, callback) => {
            callback('-100.00');
        });

        operations.creditAccount();
        expect(dataProgram.readBalance()).toBe(1000.00);
        expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
    });

    test('TC011 - Debit Negative Amount', () => {
        dataProgram.writeBalance(1100.00);

        mockRl.question.mockImplementation((query, callback) => {
            callback('-100.00');
        });

        operations.debitAccount();
        expect(dataProgram.readBalance()).toBe(1200.00);
        expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 1200.00');
    });

    test('TC012 - Large Amount Credit', () => {
        dataProgram.writeBalance(1200.00);

        mockRl.question.mockImplementation((query, callback) => {
            callback('999999.99');
        });

        operations.creditAccount();
        expect(dataProgram.readBalance()).toBe(1001199.99);
        expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1001199.99');
    });

    test('TC014 - Decimal Amount Handling', () => {
        mockRl.question.mockImplementation((query, callback) => {
            callback('123.45');
        });

        operations.creditAccount();
        expect(dataProgram.readBalance()).toBe(1123.45);
        expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1123.45');
    });
});