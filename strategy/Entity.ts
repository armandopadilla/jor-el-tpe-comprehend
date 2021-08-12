import {
    ComprehendClient,
    DetectEntitiesCommand,
    LanguageCode
} from "@aws-sdk/client-comprehend";

export default class Entity {
    private constructor(){}

    public static async run(input: string) {
        try {
            const AWSComprehendClient = new ComprehendClient({ region: 'us-west-2'});
            const commandEntity = new DetectEntitiesCommand({
                LanguageCode: LanguageCode.EN,
                Text: input
            })

            return AWSComprehendClient.send(commandEntity);
        } catch (error) {
            throw error;
        }
    }
}
