const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex')
const bcrypt = require('bcrypt-nodejs');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'virajguntamukkala',
    password : '',
    database : 'smartbrains-db'
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  if (email === '' || name === '' || password === '') {
    res.status(400).json("Error: Unable to register")
  } else {
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        db('users')
        .returning('*')
        .insert({
          name: name,
          email: loginEmail[0],
          joined: new Date()   
        })
        .then(user => {
          res.json(user[0])
        })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json("Error: Unable to register"))
  }
})

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        db.select('*').from('users').where('email', '=', email)
        .then(user => {
          res.json(user[0])
        })
        .catch(err => res.status(400).json('Error: Unable to get user'))
      } else {
        res.status(400).json('Error: Unable to get user')
      }
    })
  .catch(err => res.status(400).json('Error: Unable to get user'))
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db('users')
    .where('id', id)
    .then(response => {
      if (response.length === 0) {
        throw new Error('Error: User not found');
      }
      else {
        res.json(response[0])
      }
    })
  .catch(err => res.status(400).json(err.message))
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0])
    })
    .catch(err => res.status(400).json("Error: Unable to get entries"))
})

app.listen(3000, () => {
  console.log('App is running on port 3000');
});