import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { customer_code, preferred_bank } = req.body;

  if (!customer_code) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: customer_code'
    });
  }

  try {
    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      {
        customer: customer_code,
        preferred_bank: preferred_bank // Optional: default to Wema if not provided
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Dedicated account created successfully',
      data: response.data.data
    });

  } catch (error) {
    console.error('Paystack Error:', error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to create dedicated account',
      error: error.response?.data?.message || error.message
    });
  }
}