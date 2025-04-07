// single_test_script.js
// Secure API testing script
// USES ENVIRONMENT VARIABLES FOR API KEYS
// TEMPORARILY MODIFIED TO TEST /companies/analytics for employee categories with Authorization header

import fetch from 'node-fetch';

// --- Configuration (Using environment variables) ---
// Use environment variables for API keys
const openaiApiKey = process.env.OPENAI_API_KEY;

// Companies API Key from environment variable
const companiesApiKey = process.env.COMPANIES_API_KEY;
// --- End Configuration ---


const COMPANIES_API_BASE_URL = 'https://api.thecompaniesapi.com/v2';

// --- Main Logic ---
async function main() {
    console.log("--- Bubo API Tester (Analytics Endpoint Test - Bearer Auth) ---");
    console.warn("WARNING: This script requires COMPANIES_API_KEY environment variable to be set!");

    if (!companiesApiKey) {
        console.error("ERROR: Companies API key environment variable (COMPANIES_API_KEY) is not set.");
        return;
    }

    // 1. Construct URL for Analytics Endpoint
    // We want to aggregate by 'about.totalEmployees'
    const analyticsAttribute = 'about.totalEmployees';
    // Add size=100 to see more categories if available
    const companiesApiUrl = `${COMPANIES_API_BASE_URL}/companies/analytics?attribute=${analyticsAttribute}&size=100`;
    console.log("Requesting URL:", companiesApiUrl);

    // 2. Call "The Companies API" Analytics Endpoint
    console.log("\nFetching analytics for 'about.totalEmployees' categories with Bearer Authentication...");
    try {
        const analyticsResponse = await fetch(companiesApiUrl, {
            method: 'GET',
            headers: {
                 // Using Authorization: Bearer header
                'Authorization': `Bearer ${companiesApiKey}`
            }
        });

        // Check response status
        if (!analyticsResponse.ok) {
             console.error(`\nReceived non-OK status: ${analyticsResponse.status} ${analyticsResponse.statusText}`);
             try {
                 const errorBody = await analyticsResponse.json();
                 console.error(`API Error Details:`, JSON.stringify(errorBody));
             } catch(e) {
                 const errorText = await analyticsResponse.text();
                 console.error(`API Error Body: ${errorText}`);
             }
             return; // Stop execution on error
        }

        // If response is OK, proceed to parse results
        const analyticsResult = await analyticsResponse.json();
        console.log("\n--- Analytics Results ---");

        if (analyticsResult.data && analyticsResult.data.length > 0) {
            console.log(`Found ${analyticsResult.data.length} categories for 'about.totalEmployees':`);
            const validCategories = [];
            analyticsResult.data.forEach((category, index) => {
                // The actual category string is in the 'name' field according to docs example
                const categoryName = category.name;
                const categoryCount = category.count;
                console.log(` ${index + 1}. Category Name: "${categoryName}" (Count: ${categoryCount})`);
                if (categoryName && categoryName.toLowerCase() !== 'missing') { // Exclude 'missing' category
                    validCategories.push(categoryName);
                }
            });
            console.log("\nPotential VALID category strings for filtering:", validCategories);
            console.log("\nUse these strings EXACTLY in the 'values' array when filtering 'about.totalEmployees' with sign 'equals'.");

        } else {
            console.log("No categories found or unexpected response format.");
            console.log("Raw Response:", JSON.stringify(analyticsResult, null, 2));
        }

    } catch (error) {
        console.error("\nError during Companies API analytics call:", error);
    }
}

// Run the main function
main();