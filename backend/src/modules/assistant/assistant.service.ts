import { intentParserService } from './intent-parser.service.js';
import { queryPlannerService } from './query-planner.service.js';
import { evidenceBuilderService } from './evidence-builder.service.js';
import { answerValidatorService } from './answer-validator.service.js';

export const assistantService = {
  async processQuery(storeId: string, question: string) {
    const intent = await intentParserService.parse(question);
    const figures = await queryPlannerService.execute(storeId, intent);
    const evidence = evidenceBuilderService.build(storeId, intent, figures);
    const answer = await answerValidatorService.generateAndValidate(question, figures, evidence);

    return {
      question,
      intent,
      answer,
      evidence,
      figures
    };
  }
};
