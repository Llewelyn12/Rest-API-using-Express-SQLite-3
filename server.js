const express = require('express');
const  sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db');

app.use(express.json());

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT, password TEXT)`);
});


app.post('/users', (req, res) => {
    const {username, email, password} = req.body;
    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, ["Llewelyn", "roboto@gmail.com", "1234"], function(err) {
        if (err) {
            res.status(500).json({error:err.message});
            return;
        }
        res.status(201).json({id: this.lastID, username, email, password});
    });
});


app.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json(rows);
    });
});


app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        if (!row) {
            res.status(404).json({error: 'user not found'});
            return;
        }
        res.json(row);
    });
});


app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const {username, email, password} = req.body;
    db.run(`UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?`, [username, email, password, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message});
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({error: 'user not found'});
            return;
        }
        res.json({id, username, email, password});
    });
});


app.delete('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        res.status(400).json({error: 'Invalid ID'});
        return;
    }
    db.run(`DELETE FROM users WHERE id = ?`,[id], function(err) {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({error: 'user not found'});
            return;
        }
        res.json({message: 'user deleted'});
    });
});


app.listen(port, () => {
    console.log('server running at http://localhost:${port}');
});
