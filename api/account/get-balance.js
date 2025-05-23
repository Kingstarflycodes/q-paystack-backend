// /api/get-balance.js
import axios from 'axios';

export default async function handler(req, res) {
  const { customerCode } = req.query;

  if (!customerCode) {
    return res.status(400).json({ error: "Missing customerCode" });
  }

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  try {
    const url = `https://api.paystack.co/customer/${customerCode}/transactions`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    const transactions = response.data.data.filter(txn =>
      txn.status === 'success' && txn.channel === 'bank'
    );

    const totalReceived = transactions.reduce((sum, txn) => sum + txn.amount / 100, 0);

    return res.status(200).json({ totalReceived });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
}