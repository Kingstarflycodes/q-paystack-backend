import axios from 'axios';

export default async function handler(req, res) {
  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, first_name, last_name } = req.body;

  // Validate required fields
  if (!email || !first_name || !last_name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: email, first_name, last_name' 
    });
  }

  try {
    const response = await axios.post(
      'https://api.paystack.co/customer',
      { email, first_name, last_name },
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
      message: 'Failed to create customer',
      error: error.response?.data?.message || 'Internal server error'
    });
  }
}