const SparkPost = require('sparkpost');
const client = new SparkPost(process.env.SPARKPOST_API_TOKEN);
import { IMessageMail } from '../models/message';

// If you have a SparkPost EU account you will need to pass a different `origin` via the options parameter:
// const euClient = new SparkPost('<YOUR API KEY>', { origin: 'https://api.eu.sparkpost.com:443' });

export default function sendMail(mailParams: IMessageMail) {

    const sparkPostParams = {
        options: {
            sandbox: false
        },
        content: {
            from: mailParams.from,
            subject: mailParams.subject,
            html:'<html><body>'+mailParams.message+'</body></html>'
        },
        recipients: [
            { address: mailParams.to }
        ]
    }

    client.transmissions.send(sparkPostParams)
    .then((data: any) => console.log('Woohoo! You just sent your first mailing!'))
    .catch((err: any) => console.log('Whoops! Something went wrong'));
}