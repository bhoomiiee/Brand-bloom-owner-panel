import { formatCentsToCurrency } from '../../shared/money/money.js';

export const answerValidatorService = {
  async generateAndValidate(_question: string, figures: any, _evidence: any, candidateText?: string): Promise<string> {
    if (figures.unsupported) {
      return 'This query is unsupported. The Store Intelligence Assistant is strictly read-only and only answers verified metrics from the approved registry: Revenue, Order Count, Average Order Value, Low-Stock Products, and Sales by Product.';
    }

    let deterministicAnswer = '';

    if ('revenueCents' in figures) {
      deterministicAnswer = `Based on verified order records, your store has generated ${formatCentsToCurrency(figures.revenueCents)} in revenue.`;
    } else if ('averageOrderValueCents' in figures) {
      deterministicAnswer = `Based on verified order records, your average order value (AOV) is ${formatCentsToCurrency(figures.averageOrderValueCents)} across ${figures.orderCount} paid orders.`;
    } else if ('orderCount' in figures) {
      deterministicAnswer = `You have received ${figures.orderCount} paid orders to date.`;
    } else if ('lowStockCount' in figures) {
      if (figures.lowStockCount === 0) {
        deterministicAnswer = 'All products in your store are currently stocked above their low-stock thresholds.';
      } else {
        deterministicAnswer = `There are currently ${figures.lowStockCount} items at or below your low-stock threshold.`;
      }
    } else if ('topProducts' in figures) {
      if (!figures.topProducts || figures.topProducts.length === 0) {
        deterministicAnswer = 'No product sales recorded in the verified database yet.';
      } else {
        const productList = figures.topProducts.map((p: any) => `"${p._id}" (${p.unitsSold} units)`).join(', ');
        deterministicAnswer = `Your top selling products based on verified sales are: ${productList}.`;
      }
    } else {
      deterministicAnswer = 'Verified metric retrieved from the store database.';
    }

    // Anti-hallucination validation check
    if (candidateText) {
      // If candidate text mentions fabricated numbers that contradict figures, reject and use deterministic answer
      const numbersInCandidate = candidateText.match(/\b\d+(\.\d+)?\b/g) || [];
      const validNumbers = JSON.stringify(figures);
      const hasHallucination = numbersInCandidate.some(n => !validNumbers.includes(n));
      if (hasHallucination) {
        return deterministicAnswer;
      }
      return candidateText;
    }

    return deterministicAnswer;
  }
};
