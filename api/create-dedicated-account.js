import axios from 'axios';

export default async function handler(req, res) {
  const { customerCode } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      {
        customer: customerCode,
        preferred_bank: 'wema-bank'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ success: true, data: response.data.data });
  } catch (err) {
    console.error(err.response?.data);
    res.status(500).json({ success: false, message: 'Failed to generate account' });
  }
}