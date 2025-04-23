import axios from 'axios';

export default async function handler(req, res) {
  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { customer_code, preferred_bank } = req.body;

  // Validate required fields
  if (!customer_code) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required field: customer_code' 
    });
  }

  try {
    const payload = {
      customer: customer_code,
      preferred_bank: preferred_bank || 'wema-bank' // Default to Wema Bank if not specified
    };

    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({ 
      success: true, 
      data: response.data.data 
    });
  } catch (error) {
    console.error('Paystack API error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create dedicated account',
      error: error.response?.data?.message || 'Internal server error'
    });
  }
}