import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { Session } from 'inspector';
import { isBuffer } from 'util';
import { IMessage, IRecMessage, IQuestion, IMessageMail } from '../models/message';
import sendMail from '../controllers/mail-controller';

async function sendMsg(req: Request, res: Response){
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const newMessage = req.body as IMessage;        
    
    try {
      await client.messages 
      .create({ 
         body: newMessage.msg,
         from: 'whatsapp:+'+newMessage.from,
         to:   'whatsapp:+'+newMessage.to 
       }) 
      .then((message: any) => console.log(message.sid))
      .done(res.status(200).send('mensagem enviada'));
    } catch(error) {
      res.status(400).send(error);
    }

};

const leadQuestions: any = {
  nome: '1: Qual seu nome?',
  negocio: '2: Qual seu tipo de negócio? delivery, ecommerce, turismo',
  periodo: '3: Melhor período pra contato: manhã, tarde ou noite?',
  last: ''
};

const leadAnswers: any = {
  nome: '',
  negocio: '',
  periodo: ''
};

async function getAnswer(answer: string, last_question: string, next_question: string, twiml:any, phone: string) {
   
  //SAVE THE ANSWER IN SESSION    
  leadAnswers[last_question] = answer;
  
    //CHANGE TO NEXT QUESTION
    leadQuestions.last = next_question;  
    console.log('resposta: '+ answer + ' last: ' + last_question + ' next: ' + next_question);
    
    if(next_question == 'end')  {
      //SEND THE LAST MESSAGE
      const finalMessage = 'As informações enviadas foram:\n'+
      '*Nome:* ' +leadAnswers.nome + '\n'+
      '*Negócio:* ' +leadAnswers.negocio + '\n'+
      '*Telefone:* ' + phone + '\n'+
      '*Período para contato:* ' + leadAnswers.periodo + '\n\n'+
      'Nosso comercial já foi notificado do seu pedido\n'+
      'Faremos contato em até *24h úteis*\n'+
      'Agradecemos seu interesse!'
      
      await twiml.message(finalMessage);
      
      //SET THIS TO BOT RESTART READ GREETINGS
      leadQuestions.last = null;

      console.log('enviando email ...');
      
      //NOTIFY COMERCIAL EMAIL
      const mailParams: IMessageMail = {
        from: 'contato@internetenegocios.com.br',
        to: 'contato@w3interativa.com.br',
        subject: 'SALES BOT - Lead Gerado',
        message: finalMessage.replace(/\n/g, '<br />')
      }

      try {
        sendMail(mailParams);
      } catch(error) {
        console.log(error);
      }

    }
    else
      twiml.message(leadQuestions[next_question]);  
}

function recieveMsg(req: Request, res: Response) {
  
  //GET RECIEVE MSG
  const recMessage = req.body as IRecMessage;  

  // PREPARE RESPONSE
  const MessagingResponse = require('twilio').twiml.MessagingResponse;     
  const twiml = new MessagingResponse();

  const grettings =  ["olá", "ola", "oi", "bom dia", "boa tarde", "boa noite"];
  //const options = ['menu', 'ajuda', 'humano'];
  
  const menu = '*Este são as opções em nosso menu*:\n'+
  '*1* - Para quem serve?\n'+
  '*2* - Quanto custa o Sales Bot?\n'+
  '*3* - Quero falar com alguém!';

  console.log('last:' + leadQuestions.last);

  //CHECK MESSAGE AND SEND CORRECT RESPONSE
  if( grettings.some(el => recMessage.Body.toLowerCase().includes(el)) && !leadQuestions.last)
    twiml.message('Olá, seja mt bem vindo(a)! 😃 Para conhecer as opções de atendimento basta enviar a palavra *menu*');
  else if( recMessage.Body.toLowerCase().includes('menu') )
      twiml.message(menu);
  else if(recMessage.Body == '1')
    twiml.message('O *Sales Bot* aplica-se para *qualquer profissional ou empresa* que deseja automatizar seu processo de atendimento e *aumentar as vendas* usando o Whatsapp.');
  else if(recMessage.Body == '2')
    twiml.message('Você pode ter seu robô de vendas trabalhando por você 24h por dia, *a partir de R$99/mensais* + custos de mensagens.\n Escolha a opção 3 para que nossa equipe de comercial faça contato.');
  else if(recMessage.Body == '3' && !leadQuestions.last) {
    twiml.message('Ótimo, temos certeza de que o *Sales Bot* vai agilizar seu atendimento e aumentar suas vendas. \n *Por favor, para prosseguir informe os dados que serão solicitados.*');
    
    //SET THE QUESTIONS SESSION
    leadQuestions.last = 'nome';    

    //SEND THE FIRST QUESTION
    twiml.message(leadQuestions.nome);  
  }
  else if(leadQuestions.last == 'nome')
    getAnswer(recMessage.Body, 'nome', 'negocio', twiml, recMessage.From);    

  else if(leadQuestions.last == 'negocio')
    getAnswer(recMessage.Body, 'negocio', 'periodo', twiml, recMessage.From);  

  else if(leadQuestions.last == 'periodo')
    getAnswer(recMessage.Body, 'periodo', 'end', twiml, recMessage.From);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
};

function statusMsg(req: Request, res: Response) {
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;

  console.log(`SID: ${messageSid}, Status: ${messageStatus}`);
  //console.log(req.body);

  res.sendStatus(200);
}

export default { sendMsg, recieveMsg, statusMsg };