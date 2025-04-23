import axios from 'axios';

export default async function handler(req, res) {
  const { reference } = req.query;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const payment = response.data.data;
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    console.error(err.response?.data);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
}