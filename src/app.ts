//app.ts
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import salesBotRouter from './routes/bot-router';
import session from 'express-session';

const app = express();
app.use(helmet());
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:'FFt4789!@', resave:false, saveUninitialized:true}));

app.use(salesBotRouter);


const port = parseInt(`${process.env.PORT}`);

app.listen(port);
console.log(`Rodando na porta ${port}`);