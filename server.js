import express from 'express'
import mongodb from 'mongodb'
import bodyParser from 'body-parser'
import fs from 'fs'
import * as path from 'path';

const __dirname = path.resolve();
const app = express()
const port = 5000
const {
    MongoClient
} = mongodb;

const uri = 'mongodb+srv://myuser:admin1111@cluster0.1150p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const conn = await MongoClient.connect(uri, {
    newUrlParser: true,
    useUnifiedTopology: true
});
const db = conn.db('test');

// fs.readFile('dictionary.json', async function (err, data) {
//     const dictionary = JSON.parse(data)
//     await db.collection('dictionary').insertMany(dictionary)
// })

app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

app.post('/add-word', async (req, res) => {
    if (Object.keys(req.body).length) {
        const {
            name,
            value
        } = req.body;
        await db.collection('dictionary').insertOne({
            name,
            value
        })
        res.send('Термин добавлен в глоссарий')
    } else {
        res.send('Что-то пошло не так')
    }
})

app.get('/', async (req, res) => {
    let result = await db.collection('dictionary').find({}).toArray();

    if (result) {
        console.log(result)
        res.render('list', {
            title: 'Глоссарий',
            result
        });
    } 
})

app.get('/mindmap', (req, res) => {
    res.sendFile(path.join(__dirname, 'mindmap.jpg'));
})

app.get('/:word', async (req, res) => {

    const word = req.params.word;

    let result = await db.collection('dictionary').findOne({
        name: word
    });
    if (result) {
        const {
            name,
            value
        } = result;
        res.render('index', {
            title: 'Глоссарий',
            name,
            value
        });
    } else {
        res.render('form', {
            title: 'Глоссарий'
        })
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})