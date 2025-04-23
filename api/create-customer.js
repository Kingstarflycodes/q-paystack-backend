import axios from 'axios';

export default async function handler(req, res) {
  const { email, first_name, last_name } = req.body;

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

    res.status(200).json({ success: true, data: response.data.data });
  } catch (err) {
    console.error(err.response?.data);
    res.status(500).json({ success: false, message: 'Error creating customer' });
  }
}