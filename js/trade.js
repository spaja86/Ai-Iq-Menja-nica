// Trade logic

class MarketTrade {
    constructor(feePercentage = 0.01) {
        this.feePercentage = feePercentage;
    }

    buy(amount, price) {
        const totalCost = amount * price;
        const fee = totalCost * this.feePercentage;
        return totalCost + fee;
    }

    sell(amount, price) {
        const totalRevenue = amount * price;
        const fee = totalRevenue * this.feePercentage;
        return totalRevenue - fee;
    }
}

// Example usage:
const trade = new MarketTrade();
const buyCost = trade.buy(100, 10); // 100 units at $10 each
const sellRevenue = trade.sell(100, 15); // Selling 100 units at $15 each

console.log('Buy Cost:', buyCost);
console.log('Sell Revenue:', sellRevenue);
