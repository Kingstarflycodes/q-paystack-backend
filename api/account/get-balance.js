import axios from 'axios';

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return null;
  return input.trim().replace(/[<>"'&]/g, '');
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: 'POST'
    });
  }

  const { customerCode } = req.body;

  // Validate customerCode
  const sanitizedCustomerCode = sanitizeInput(customerCode);
  if (!sanitizedCustomerCode || sanitizedCustomerCode.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid or missing customerCode in request body'
    });
  }

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET) {
    return res.status(500).json({ 
      error: 'Server configuration error: Missing Paystack secret key'
    });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/customer/${sanitizedCustomerCode}/transactions`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.data)) {
      return res.status(500).json({ 
        error: 'Invalid response format from Paystack API'
      });
    }

    const transactions = response.data.data;

    const successfulBankTransactions = transactions.filter(txn => {
      return txn && 
             txn.status === 'success' && 
             txn.channel === 'bank' && 
             typeof txn.amount === 'number';
    });

    const totalReceived = successfulBankTransactions.reduce((sum, txn) => {
      return sum + (txn.amount / 100);
    }, 0);

    return res.status(200).json({
      customerCode: sanitizedCustomerCode,
      totalReceived: Number(totalReceived.toFixed(2)), // Round to 2 decimal places
      transactionCount: successfulBankTransactions.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    // Detailed error handling
    const errorMessage = error.response?.data?.message || error.message;
    const statusCode = error.response?.status || 500;

    console.error('Paystack API Error:', {
      message: errorMessage,
      status: statusCode,
      customerCode: sanitizedCustomerCode
    });

    return res.status(statusCode).json({ 
      error: 'Failed to fetch transactions',
      details: errorMessage
    });
  }
}