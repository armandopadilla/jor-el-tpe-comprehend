import {
    ComprehendClient,
    DetectKeyPhrasesCommand,
    LanguageCode
} from "@aws-sdk/client-comprehend";

export default class KeyPhase {
    private constructor(){}

    public static async run(input: string) {
        try {
            const AWSComprehendClient = new ComprehendClient({ region: 'us-west-2'});
            const commandKP = new DetectKeyPhrasesCommand({
                LanguageCode: LanguageCode.EN,
                Text: input
            });

            return AWSComprehendClient.send(commandKP);
        } catch (error) {
            throw error;
        }
    }
}
