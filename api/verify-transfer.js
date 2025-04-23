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

    res.status(200).json({
      status: true,
      data: response.data.data
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ status: false });
  }
}