import Sentiment from "./Sentiment";
import KeyPhase from "./KeyPhrase";
import Entity from "./Entity";

export enum STRATEGY_TYPES {
    SENTIMENT,
    KEYPHRASE,
    ENTITY
};

export default class AWSComprehendStrategy {
    private constructor(){}

    public static async runStrategy(strategy: STRATEGY_TYPES, input: string) {
        switch (strategy) {
            case STRATEGY_TYPES.SENTIMENT: {
                return Sentiment.run(input)
            }
            case STRATEGY_TYPES.KEYPHRASE: {
                return KeyPhase.run(input)
            }
            case STRATEGY_TYPES.ENTITY: {
                return Entity.run(input);
            }
        }
    }
}
