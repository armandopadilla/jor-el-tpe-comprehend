/**
 * Fetch sentiment, keyphrases, entities from the input text using AWS.
 */
import {
  DetectEntitiesCommandOutput,
  DetectKeyPhrasesCommandOutput,
  DetectSentimentCommandOutput,
} from '@aws-sdk/client-comprehend'
import {SNSHandler} from 'aws-lambda';
import AWSComprehendStrategy, {STRATEGY_TYPES} from  './strategy';
import * as mysql from 'mysql2';

// ENV
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

const handler: SNSHandler = async (event, context, cb) => {
  try {
    // Check if we have a message
    if (!event) return cb(new Error('No even found.'));
    if (event.Records[0].Sns.Message === '') return cb(new Error('No raw data to process.'));

    // Get the data
    const { input, rawDataId } = JSON.parse(event.Records[0].Sns.Message);

    if (!input.trim()) return cb(new Error('No input detected'));

    // Detect Sentiment - Answers What des the user feel about a certain topic.
    const sentimentResp: DetectSentimentCommandOutput = await AWSComprehendStrategy.runStrategy(STRATEGY_TYPES.SENTIMENT, input);

    // Key-phase Extraction
    const keyPhraseResp: DetectKeyPhrasesCommandOutput = await AWSComprehendStrategy.runStrategy(STRATEGY_TYPES.KEYPHRASE, input);

    // Entity Recognition
    const entityResp: DetectEntitiesCommandOutput = await AWSComprehendStrategy.runStrategy(STRATEGY_TYPES.ENTITY, input);

    // Save to the DB
    const dbInserts = [];

    // Filter out anything that is under 70 confidence. We Save the partial JSON so we can use it later.
    if (sentimentResp) {
      const sentiment = sentimentResp.Sentiment;
      const sentimentScoreObj = sentimentResp.SentimentScore;

      dbInserts.push(`INSERT INTO dataSentiments (id, rawDataId, sentiment, sentimentScore) VALUES ('', '${rawDataId}', '${sentiment}', '${JSON.stringify(sentimentScoreObj)}')`);
    }

    if (keyPhraseResp) {
      const { KeyPhrases: keyPhrases = [] } = keyPhraseResp;
      keyPhrases.forEach(keyPhrase => {
        if (keyPhrase.Score! > .70) {
          dbInserts.push(`INSERT INTO dataKeyPhrases (id, rawDataId, keyPhase, score) VALUES ('', '${rawDataId}', '${keyPhrase.Text}', '${keyPhrase.Score}')`);
        }
      })
    }

    if (entityResp) {
      const { Entities: entities = [] } = entityResp;
      entities.forEach(entity => {
        if (entity.Score! > .70) {
          dbInserts.push(`INSERT INTO dataEntities (id, rawDataId, entityType, entityText, score) VALUES ('', '${rawDataId}', '${entity.Type}', '${entity.Text}', '${entity.Score}')`);
        }
      })
    }

    // Save to the DB.
    const dbConn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    });

    for (let query of dbInserts) {
      await dbConn.query(query);
    }


  } catch (error) {
    console.log(error)
    return cb(error);
  }
}

export default handler;
