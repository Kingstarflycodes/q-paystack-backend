import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { card_number, expiry_month, expiry_year, cvv, pin, amount, email, subaccount } = req.body;

  try {
    const response = await axios.post(
      'https://api.paystack.co/charge',
      {
        card: {
          number: card_number,
          cvv: cvv,
          expiry_month: expiry_month,
          expiry_year: expiry_year
        },
        pin: pin,
        amount: amount,
        email: email,
        subaccount: subaccount
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
    res.status(500).json({ error: error?.response?.data || 'Charge failed' });
  }
}