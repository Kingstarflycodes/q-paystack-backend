import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amount, subaccount } = req.body;

  try {
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email,
      amount: amount,
      channels: ['bank_transfer'],
      subaccount: subaccount
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data.data;

    res.status(200).json({
      status: 'pending',
      reference: data.reference,
      authorization_url: data.authorization_url,
      access_code: data.access_code
    });

  } catch (error) {
    console.error('Bank transfer init error:', error?.response?.data || error.message);
    res.status(500).json({
      error: error?.response?.data || 'Error initializing bank transfer'
    });
  }
}