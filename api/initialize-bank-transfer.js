import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, amount } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Kobo
        channels: ['bank_transfer']
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      status: true,
      data: response.data.data
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      status: false,
      message: 'Failed to initialize transfer'
    });
  }
}