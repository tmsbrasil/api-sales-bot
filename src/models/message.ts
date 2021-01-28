interface IMessage {
    to: string;
    from: string;
    msg: string;
}

interface IRecMessage {
    MessageSid: string;
    SmsSid: string;
    AccountSid: string;
    MessagingServiceSid: string;
    From: string;
    To: string;
    Body: string;
    NumMedia: string;
}

interface IQuestion {
    nome: string;
    negocio: string;
    periodo: string;    
}

interface IMessageMail {
    from: string;
    to:string;
    subject: string;
    message: string;
}

declare module 'express-session' {
    interface SessionData {
        questions: IQuestion & { last: string };
        answers: IQuestion;
    }
}

export { IMessage, IRecMessage, IQuestion, IMessageMail }