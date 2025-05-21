import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { otp, reference } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/charge/submit_otp',
      {
        otp,
        reference
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error?.response?.data || 'OTP verification failed' });
  }
}