import axios from 'axios';

// Paystack API base URL
const PAYSTACK_API_URL = 'https://api.paystack.co/transaction/initialize';

export default async function handler(req, res) {
  // Restrict to POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  // Extract and validate request body
  const { email, amount, subaccount } = req.body;

  // Input validation
  if (!email || !amount || !subaccount) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'Email, amount, and subaccount are required'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email',
      message: 'Please provide a valid email address'
    });
  }

  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ 
      error: 'Invalid amount',
      message: 'Amount must be a positive number'
    });
  }

  // Validate Paystack secret key
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Paystack secret key is not configured'
    });
  }

  try {
    const response = await axios.post(
      PAYSTACK_API_URL,
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo and ensure integer
        channels: ['bank_transfer'],
        subaccount,
        // Optional: Add metadata for better tracking
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'N/A'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000 // Set timeout to 10 seconds
      }
    );

    // Validate response structure
    if (!response.data?.data) {
      throw new Error('Invalid response from Paystack API');
    }

    const { reference, authorization_url, access_code } = response.data.data;

    return res.status(200).json({
      status: 'pending',
      reference,
      authorization_url,
      access_code,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Log error for debugging
    console.error('Paystack transaction initialization error:', {
      message: error.message,
      response: error?.response?.data,
      status: error?.response?.status
    });

    // Handle specific Paystack errors
    const statusCode = error?.response?.status || 500;
    const errorMessage = error?.response?.data?.message || 'Error initializing bank transfer';
    
    return res.status(statusCode).json({
      error: 'Transaction initialization failed',
      message: errorMessage,
      code: error?.response?.data?.code || 'UNKNOWN_ERROR'
    });
  }
}