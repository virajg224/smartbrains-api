const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]

}

const getUser = id => {
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = user;
        }
    });
    return found;
}

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(database.users)
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    database.users.push({
            id: '125',
            name: name,
            email: email,
            password: password,
            entries: 0,
            joined: new Date()
    })
    res.json({
            id: '125',
            name: name,
            email: email,
            entries: 0,
            joined: new Date()
    })
})

app.post('/signin', (req, res) => {
    if (req.body.email === database.users[0].email && 
        req.body.password === database.users[0].password) {
        res.json(database.users[0]);
    } else {
        res.status(400).json('Error logging in');
    }
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    const user = getUser(id);
    if (user === false) {
        return res.status(404).json('NOT FOUND')
    } else {
        return res.json(user);
    }
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    let user = getUser(id);
    if (user === false) {
        return res.status(404).json('NOT FOUND')
    } else {
        ++user.entries;
        return res.json(user.entries);
    }
})

app.listen(3000, () => {
    console.log('App is running on port 3000');
});