import {ComprehendClient, DetectSentimentCommand, LanguageCode} from "@aws-sdk/client-comprehend";

export default class Sentiment {
    private constructor(){}

    public static async run(input: string) {
        try {
            const AWSComprehendClient = new ComprehendClient({ region: 'us-west-2'});
            const command = new DetectSentimentCommand({
                LanguageCode: LanguageCode.EN,
                Text: input
            });

            return AWSComprehendClient.send(command);
        } catch (error) {
            throw error;
        }
    }
}
