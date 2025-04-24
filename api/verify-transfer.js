import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference } = req.query;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = response.data.data;

    if (data.status === 'success') {
      res.status(200).json({
        status: 'success',
        message: 'Transfer verified',
        amount: data.amount,
        paid_at: data.paid_at,
        channel: data.channel,
        customer_email: data.customer.email
      });
    } else {
      res.status(200).json({ status: 'pending', message: 'Payment not completed yet' });
    }

  } catch (error) {
    console.error('Verification error:', error?.response?.data || error.message);
    res.status(500).json({
      error: error?.response?.data || 'Error verifying transfer'
    });
  }
}