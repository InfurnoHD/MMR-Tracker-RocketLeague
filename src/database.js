const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'mmrdatabase.sqlite');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Could not connect to the database:', err);
    } else {
        console.log('Connected to the mmrdatabase.sqlite database.');
        createTables();
    }
});

function createTables() {
    db.run("CREATE TABLE IF NOT EXISTS mmr (mmrId INTEGER PRIMARY KEY AUTOINCREMENT, mmr INTEGER NOT NULL, date DATETIME NOT NULL)", (err) => {
        if (err) {
            console.error('Unable to create the table \'mmr\':', err);
        }
    });
}

function addMMR(mmr, date) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO mmr (mmr, date) VALUES (?, ?)", [mmr, date], function(err) {
            if (err) {
                console.error('Unable to add mmr:', err);
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

function removeLastAdded() {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM mmr WHERE mmrId = (SELECT MAX(mmrId) FROM mmr)", function(err) {
            if (err) {
                console.error('Unable to delete last data added:', err);
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

function generateMonthRange(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let monthRange = [];

    while (start <= end) {
        monthRange.push(start.toLocaleString('default', { month: 'long', year: 'numeric' }));
        start.setMonth(start.getMonth() + 1);
    }

    return monthRange;
}

function readDataToArray() {
    return new Promise((resolve, reject) => {
        let mmrVector = [];
        let dateVector = [];
        db.all("SELECT mmr, date FROM mmr ORDER BY date", [], (err, rows) => {
            if (err) {
                console.error('Unable to read data:', err);
                reject(err);
            } else {
                rows.forEach((row) => {
                    const date = new Date(row.date);
                    mmrVector.push(row.mmr);
                    dateVector.push(date);

                });
                resolve({ mmrVector, dateVector});
            }
        });
    });
}


module.exports = { addMMR, removeLastAdded, readDataToArray };
