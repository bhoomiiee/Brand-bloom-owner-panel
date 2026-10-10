export const intentParserService = {
  async parse(question: string): Promise<{ metric: string; timeRange: string; isSupported: boolean }> {
    const q = question.toLowerCase();

    // Prevent prompt injection attempts (instructions to ignore system prompt, execute code, access other stores)
    if (q.includes('ignore previous') || q.includes('system prompt') || q.includes('drop table') || q.includes('delete from') || q.includes('eval(')) {
      return { metric: 'unsupported', timeRange: 'none', isSupported: false };
    }

    if (q.includes('aov') || q.includes('average order') || q.includes('average order value')) {
      return { metric: 'average-order-value', timeRange: 'all-time', isSupported: true };
    }

    if (q.includes('revenue') || q.includes('sales total') || q.includes('how much have i made') || q.includes('earnings')) {
      return { metric: 'revenue', timeRange: 'all-time', isSupported: true };
    }

    if (q.includes('how many order') || q.includes('order count') || q.includes('total orders') || q.includes('number of orders')) {
      return { metric: 'paid-order-count', timeRange: 'all-time', isSupported: true };
    }

    if (q.includes('low stock') || q.includes('out of stock') || q.includes('low inventory') || q.includes('running low')) {
      return { metric: 'low-stock-products', timeRange: 'now', isSupported: true };
    }

    if (q.includes('top product') || q.includes('sales by product') || q.includes('best seller') || q.includes('sold the most') || q.includes('popular product')) {
      return { metric: 'sales-by-product', timeRange: 'all-time', isSupported: true };
    }

    // Unmatched / unsupported questions
    return { metric: 'unsupported', timeRange: 'none', isSupported: false };
  }
};
