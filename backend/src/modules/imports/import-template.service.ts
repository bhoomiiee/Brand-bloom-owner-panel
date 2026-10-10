export const importTemplateService = {
  getStandardHeaders() {
    return ['title', 'sku', 'price', 'description', 'stock', 'category'];
  },

  getCsvTemplate() {
    const headers = this.getStandardHeaders().join(',');
    const sample1 = 'Classic Linen Shirt,SHIRT-LIN-WHT,68.00,Breathable 100% French linen,50,Apparel';
    const sample2 = 'Japanese Denim Jeans,JEAN-SEL-32,145.00,14oz raw selvedge denim,25,Apparel';
    return `${headers}\n${sample1}\n${sample2}\n`;
  }
};
