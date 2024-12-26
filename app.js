// Your eBay App ID (API key)
const appID = 'chantell-pr-SBX-b99d9f1f9-140ccee0';

// The user's search keyword (this will come from the search input field)
const searchKeyword = 'laptop'; // Example keyword

// eBay Finding API endpoint
const baseUrl = 'https://svcs.ebay.com/services/search/FindingService/v1';

// Parameters for the API request
const params = {
  'OPERATION-NAME': 'findItemsByKeywords',
  'SERVICE-VERSION': '1.13.0',
  'SECURITY-APPNAME': appID,
  'GLOBAL-ID': 'EBAY-US',
  'keywords': searchKeyword,
  'paginationInput.entriesPerPage': '10',  // Increase to get more listings
  'sortOrder': 'BestMatch',  // Sort by best match
};

// Fetch the listings
const fetchListings = async () => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${baseUrl}?${queryString}`;

    // Fetch the data from eBay API
    const response = await fetch(url);
    const data = await response.json();

    if (data.findItemsByKeywordsResponse) {
      const items = data.findItemsByKeywordsResponse[0].searchResult[0].item;
      calculateSoldPercentage(items);
      calculateAverageTimeToSell(items);
      displayItems(items); // Display the fetched items with images
    }
  } catch (error) {
    console.error('Error fetching data from eBay API:', error);
  }
};

// Calculate the sold percentage and average time to sell
const calculateSoldPercentage = (items) => {
  let soldCount = 0;
  let totalCount = items.length;

  // Calculate sold items
  items.forEach(item => {
    if (item.sellingStatus && item.sellingStatus[0].sellingState[0] === 'EndedWithSales') {
      soldCount++;
    }
  });

  // Calculate sold percentage
  const soldPercentage = ((soldCount / totalCount) * 100).toFixed(2);
  console.log(`Sold Percentage: ${soldPercentage}%`);
};

const calculateAverageTimeToSell = (items) => {
  let totalTime = 0;
  let completedCount = 0;

  items.forEach(item => {
    if (item.sellingStatus && item.sellingStatus[0].sellingState[0] === 'EndedWithSales') {
      const startTime = new Date(item.listingInfo[0].startTime[0]);
      const endTime = new Date(item.sellingStatus[0].endTime[0]);

      const timeToSell = (endTime - startTime) / (1000 * 60 * 60); // Time in hours
      totalTime += timeToSell;
      completedCount++;
    }
  });

  if (completedCount > 0) {
    const averageTime = (totalTime / completedCount).toFixed(2);
    console.log(`Average Time to Sell: ${averageTime} hours`);
  } else {
    console.log('No completed auctions found to calculate average time.');
  }
};

// Display items and their details, including images
const displayItems = (items) => {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';  // Clear previous results
  
  if (items && items.length > 0) {
    items.forEach(item => {
      const listingDiv = document.createElement('div');
      listingDiv.classList.add('listing');

      // Extract data from the item
      const title = item.title[0];
      const price = item.price[0].value;
      const currency = item.price[0].currencyId;
      const condition = item.condition[0].conditionDisplayName[0];
      const itemURL = item.viewItemURL[0];
      const imageURL = item.galleryURL ? item.galleryURL[0] : '';  // eBay image URL

      // Build the HTML for this listing
      listingDiv.innerHTML = `
        <img src="${imageURL}" alt="${title}">
        <a href="${itemURL}" target="_blank">${title}</a>
        <p class="price">${currency} ${price}</p>
        <p>Condition: ${condition}</p>
      `;
      
      // Append the listing to the results div
      resultsDiv.appendChild(listingDiv);
    });
  } else {
    resultsDiv.innerHTML = '<p>No results found.</p>';
  }
};

// Trigger the fetch function
fetchListings();
