require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');

// console.log(process.env.API_TOKEN);

const app = express();


// Check if the env.var is set to production by heroku, if it is set it to tiny, else make it common.

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

// THESE GET HANDLERES ARE CALLED MIDDLEWARE, AND WE ARE ABLE TO ACCESS MULTIPLE


// WE WANT TO VALIDATE BEFORE REQUREST IS MADE TO GET

app.use(function validateBearerToken(req,res,next){

    const apiToken = process.env.API_TOKEN
    const authoToken = req.get('Authorization')
    console.log('validate bearer token middleware');


    if(!authoToken || authoToken.split(' ')[1] !== apiToken){
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    
    // MOVE TO THE NEXT MIDDLEWARE
    next()
});

app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { error }
    }
    res.status(500).json(response);
});

function handleGetTypes(req,res) {
    res.json(validTypes);
}

function handleGetPokemon(req,res){
    const {name, type} = req.query;
    let response = POKEDEX.pokemon;

    if(name) {
        response = response.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))
    }
    if(type){
        response = response.filter(pokemon => pokemon.type.includes(type))
    }
    
    res.json(response)
}


app.get('/types', handleGetTypes)
app.get('/pokemon',handleGetPokemon)

const PORT = process.env.PORT || '8000';

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
