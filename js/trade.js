// Front-end market trade implementation
// Default selected coin: BTC (Bitcoin)

let selectedCoin = 'BTC';
let resultsContainer = document.getElementById('results');

// Fetch EUR/RSD exchange rate
async function fetchExchangeRate() {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
    const data = await response.json();
    return data.rates.RSD;
}

// Calculate BUY/SELL prices with 2% fee
function calculateTrade(price, amount) {
    const fee = 0.02 * price * amount;
    return {buyPrice: price + fee, sellPrice: price - fee};
}

// Implement coin search + list + load more (mode A)
async function searchCoins(query) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
    const coins = await response.json();
    return coins.filter(coin => coin.name.toLowerCase().includes(query.toLowerCase()));
}

// Searchable dropdown (mode B)
function createDropdown(coins) {
    const dropdown = document.createElement('select');
    coins.forEach(coin => {
        const option = document.createElement('option');
        option.value = coin.id;
        option.textContent = coin.name;
        dropdown.appendChild(option);
    });
    return dropdown;
}

// Render results in #results
function renderResults(coins) {
    resultsContainer.innerHTML = '';
    coins.forEach(coin => {
        const item = document.createElement('div');
        item.innerHTML = `<strong>${coin.name}</strong> - ${coin.current_price} USD`;
        resultsContainer.appendChild(item);
    });
}

// Main function
async function main() {
    const rsdPrice = await fetchExchangeRate();
    console.log(`EUR/RSD: ${rsdPrice}`);
    // Further implementation...
}

main();